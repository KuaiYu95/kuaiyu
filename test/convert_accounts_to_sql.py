#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 MongoDB 导出的 accounts.json 转换为 SQL 文件
"""

import json
import re
from datetime import datetime
from collections import defaultdict

def sanitize_sql_string(value):
    """转义 SQL 字符串中的特殊字符"""
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        # 转义单引号和反斜杠
        return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"
    return str(value)

def generate_key_from_name(name, type_val='expense'):
    """从中文名称生成英文 key"""
    # 支出类型映射表
    expense_key_map = {
        '餐饮': 'food',
        '购物': 'shopping',
        '交通': 'transport',
        '预/充值': 'prepaid',
        '娱乐': 'entertainment',
        '医疗': 'medical',
        '教育': 'education',
        '住房': 'housing',
        '其他': 'other',
        '旅游': 'travel',
        '生活': 'living',
    }
    
    # 收入类型映射表
    income_key_map = {
        '工资': 'salary',
        '奖金': 'bonus',
        '红包': 'red_packet',
        '转账': 'transfer',
        '返现': 'cashback',
        '退款': 'refund',
        '中奖': 'lottery',
        '代付': 'charge_back',
        '其他': 'other',
    }
    
    if type_val == 'income':
        base_key = income_key_map.get(name, name.lower().replace('/', '_').replace(' ', '_'))
        return f"income_{base_key}"
    else:
        base_key = expense_key_map.get(name, name.lower().replace('/', '_').replace(' ', '_'))
        return base_key

def timestamp_to_datetime(timestamp):
    """将时间戳转换为 MySQL datetime 格式"""
    if timestamp:
        dt = datetime.fromtimestamp(timestamp / 1000)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return 'NOW()'

def main():
    # 读取 JSON 文件
    print("正在读取 accounts.json...")
    with open('accounts.json', 'r', encoding='utf-8') as f:
        accounts = json.load(f)
    
    print(f"共读取 {len(accounts)} 条记录")
    
    # 收集所有唯一的分类（按 type 和 category 分组）
    categories_map = {}  # {(type, category_name): key}
    category_id_map = {}  # {(type, category_name): id} 用于后续生成账单时引用
    
    print("\n正在分析分类...")
    for account in accounts:
        if 'type' in account and 'category' in account:
            type_val = account['type']
            category_name = account['category']
            key = (type_val, category_name)
            if key not in categories_map:
                # 生成 key，根据类型区分
                categories_map[key] = generate_key_from_name(category_name, type_val)
    
    print(f"发现 {len(categories_map)} 个唯一分类")
    
    # 生成 SQL 文件
    sql_lines = []
    sql_lines.append("-- ===========================================")
    sql_lines.append("-- 从 MongoDB accounts.json 转换的 SQL 数据")
    sql_lines.append(f"-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append("-- ===========================================")
    sql_lines.append("")
    sql_lines.append("SET NAMES utf8mb4;")
    sql_lines.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_lines.append("")
    
    # 生成分类 INSERT 语句
    sql_lines.append("-- ===========================================")
    sql_lines.append("-- 插入分类数据")
    sql_lines.append("-- ===========================================")
    sql_lines.append("")
    
    # 先按 type 分组，然后按名称排序
    sorted_categories = sorted(categories_map.items(), key=lambda x: (x[0][0], x[0][1]))
    
    category_id = 1
    for (type_val, category_name), key in sorted_categories:
        category_id_map[(type_val, category_name)] = category_id
        sql_lines.append(
            f"INSERT IGNORE INTO `categories` (`name`, `key`, `type`, `created_at`) VALUES "
            f"({sanitize_sql_string(category_name)}, {sanitize_sql_string(key)}, "
            f"{sanitize_sql_string(type_val)}, NOW());"
        )
        category_id += 1
    
    sql_lines.append("")
    
    # 生成账单 INSERT 语句
    sql_lines.append("-- ===========================================")
    sql_lines.append("-- 插入账单数据")
    sql_lines.append("-- ===========================================")
    sql_lines.append("")
    
    # 批量插入，每 1000 条一个 INSERT 语句
    batch_size = 1000
    batch_count = 0
    
    for i in range(0, len(accounts), batch_size):
        batch = accounts[i:i+batch_size]
        batch_count += 1
        
        sql_lines.append(f"-- 批次 {batch_count} ({len(batch)} 条记录)")
        sql_lines.append("INSERT INTO `bills` (")
        sql_lines.append("  `type`, `category_id`, `amount`, `desc`, `date`, `period_type`, ")
        sql_lines.append("  `is_consumed`, `refund`, `refund_type`, `created_at`")
        sql_lines.append(") VALUES")
        
        values = []
        for account in batch:
            type_val = account.get('type', 'expense')
            category_name = account.get('category', '')
            # 使用子查询获取 category_id，避免硬编码 ID
            category_key = categories_map.get((type_val, category_name), 'other')
            if type_val == 'income' and not category_key.startswith('income_'):
                category_key = f"income_{category_key}"
            category_id_expr = f"(SELECT id FROM categories WHERE `key` = {sanitize_sql_string(category_key)} AND `type` = {sanitize_sql_string(type_val)} LIMIT 1)"
            
            # desc 字段：subCategory-desc
            sub_category = account.get('subCategory', '')
            desc = account.get('desc', '')
            if sub_category and desc:
                full_desc = f"{sub_category}-{desc}"
            elif sub_category:
                full_desc = sub_category
            else:
                full_desc = desc
            
            amount = account.get('amount', 0)
            date = account.get('date', '')
            period_type = account.get('avg', 'month')
            if period_type not in ['month', 'year']:
                period_type = 'month'
            
            # is_consumed 默认都是 true
            is_consumed = 1
            
            # refund 和 refund_type 的处理逻辑
            # 根据用户说明：
            # - chargeBack: true 表示此订单有退款
            # - close: true 表示此订单无代付
            # - refund_type: 1-退款，2-代付，0-无
            original_refund = account.get('refund', 0) or 0
            close = account.get('close', True)
            charge_back = account.get('chargeBack', False)
            
            # 根据业务逻辑：
            # - 如果 chargeBack 为 true，refund_type = 1（退款）
            # - 如果 close 为 false，refund_type = 2（代付）
            # - 如果两者都不满足，refund_type = 0（无）
            if charge_back:
                # 有退款
                refund_amount = original_refund
                refund_type = 1
            elif not close:
                # 有代付但无退款
                refund_amount = original_refund
                refund_type = 2
            else:
                # 无退款无代付
                refund_amount = 0
                refund_type = 0
            
            created_at = timestamp_to_datetime(account.get('create'))
            if created_at == 'NOW()':
                created_at_str = 'NOW()'
            else:
                created_at_str = sanitize_sql_string(created_at)
            
            value = (
                f"({sanitize_sql_string(type_val)}, "
                f"{category_id_expr}, "
                f"{amount}, "
                f"{sanitize_sql_string(full_desc)}, "
                f"{sanitize_sql_string(date)}, "
                f"{sanitize_sql_string(period_type)}, "
                f"{is_consumed}, "
                f"{refund_amount}, "
                f"{refund_type}, "
                f"{created_at_str})"
            )
            values.append(value)
        
        sql_lines.append(",\n".join(values) + ";")
        sql_lines.append("")
    
    sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_lines.append("")
    
    # 写入 SQL 文件
    output_file = 'accounts_migration.sql'
    print(f"\n正在写入 SQL 文件: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"转换完成！")
    print(f"- 分类数量: {len(categories_map)}")
    print(f"- 账单数量: {len(accounts)}")
    print(f"- 输出文件: {output_file}")

if __name__ == '__main__':
    main()

