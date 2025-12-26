// ===========================================
// 系统设置页面
// ===========================================

import { configApi, uploadApi } from '@/lib/api';
import { Add, Delete, Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';

// Footer 右侧链接类型
interface FooterLink {
  title: string;
  url: string;
}

interface FooterCategory {
  category: string;
  links: FooterLink[];
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 配置数据
  const [siteLogo, setSiteLogo] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteIcp, setSiteIcp] = useState('');
  const [homeAvatar, setHomeAvatar] = useState('');
  const [homeNickname, setHomeNickname] = useState('');
  const [homeAbout, setHomeAbout] = useState('');
  const [footerLeftImage, setFooterLeftImage] = useState('');
  const [footerLeftName, setFooterLeftName] = useState('');
  const [footerLeftDescription, setFooterLeftDescription] = useState('');
  const [footerRightCategories, setFooterRightCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await configApi.get();
        const data = res.data;
        setSiteLogo(data.site_logo || '');
        setSiteName(data.site_name || '');
        setSiteIcp(data.site_icp || '');
        setHomeAvatar(data.home_avatar || '');
        setHomeNickname(data.home_nickname || '');
        setHomeAbout(data.home_about || '');
        setFooterLeftImage(data.footer_left_image || '');
        setFooterLeftName(data.footer_left_name || '');
        setFooterLeftDescription(data.footer_left_description || '');
        // 解析右侧链接配置
        if (data.footer_right_categories && Array.isArray(data.footer_right_categories)) {
          setFooterRightCategories(data.footer_right_categories);
        } else {
          setFooterRightCategories([]);
        }
      } catch (err) {
        setError('加载配置失败');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await configApi.update([
        { key: 'site_logo', value: siteLogo, type: 'image' },
        { key: 'site_name', value: siteName, type: 'string' },
        { key: 'site_icp', value: siteIcp, type: 'string' },
        { key: 'home_avatar', value: homeAvatar, type: 'image' },
        { key: 'home_nickname', value: homeNickname, type: 'string' },
        { key: 'home_about', value: homeAbout, type: 'string' },
        { key: 'footer_left_image', value: footerLeftImage, type: 'image' },
        { key: 'footer_left_name', value: footerLeftName, type: 'string' },
        { key: 'footer_left_description', value: footerLeftDescription, type: 'string' },
        { key: 'footer_right_categories', value: footerRightCategories, type: 'json' },
      ]);
      setSuccess('保存成功');
    } catch (err) {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadApi.upload(file);
      setter(res.data.url);
    } catch (err) {
      setError('图片上传失败');
    }
  };

  // Footer 右侧链接管理函数
  const addCategory = () => {
    if (footerRightCategories.length >= 3) {
      setError('最多只能配置3个类别');
      return;
    }
    setFooterRightCategories([...footerRightCategories, { category: '', links: [] }]);
  };

  const removeCategory = (index: number) => {
    setFooterRightCategories(footerRightCategories.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, category: string) => {
    const updated = [...footerRightCategories];
    updated[index].category = category;
    setFooterRightCategories(updated);
  };

  const addLink = (categoryIndex: number) => {
    const updated = [...footerRightCategories];
    updated[categoryIndex].links.push({ title: '', url: '' });
    setFooterRightCategories(updated);
  };

  const removeLink = (categoryIndex: number, linkIndex: number) => {
    const updated = [...footerRightCategories];
    updated[categoryIndex].links = updated[categoryIndex].links.filter((_, i) => i !== linkIndex);
    setFooterRightCategories(updated);
  };

  const updateLink = (categoryIndex: number, linkIndex: number, field: 'title' | 'url', value: string) => {
    const updated = [...footerRightCategories];
    updated[categoryIndex].links[linkIndex][field] = value;
    setFooterRightCategories(updated);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          系统设置
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* 网站基础配置 */}
      <Paper sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" mb={2}>网站基础配置</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {siteLogo && (
            <Box component="img" src={siteLogo} sx={{ width: 60, height: 60, borderRadius: 1 }} />
          )}
          <Button variant="outlined" component="label">
            上传 Logo
            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, setSiteLogo)} />
          </Button>
        </Box>
        <TextField
          fullWidth
          label="网站名称"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="备案号"
          value={siteIcp}
          onChange={(e) => setSiteIcp(e.target.value)}
        />
      </Paper>

      {/* 首页配置 */}
      <Paper sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" mb={2}>首页配置</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {homeAvatar && (
            <Box component="img" src={homeAvatar} sx={{ width: 80, height: 80, borderRadius: '50%' }} />
          )}
          <Button variant="outlined" component="label">
            上传头像
            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, setHomeAvatar)} />
          </Button>
        </Box>
        <TextField
          fullWidth
          label="昵称"
          value={homeNickname}
          onChange={(e) => setHomeNickname(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>关于我 (Markdown)</Typography>
        <Box data-color-mode="dark">
          <MDEditor
            value={homeAbout}
            onChange={(val) => setHomeAbout(val || '')}
            height={200}
          />
        </Box>
      </Paper>

      {/* Footer 配置 */}
      <Paper sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" mb={2}>Footer 配置</Typography>

        {/* 左侧配置 */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>左侧配置</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {footerLeftImage && (
            <Box component="img" src={footerLeftImage} sx={{ width: 60, height: 60, borderRadius: 1 }} />
          )}
          <Button variant="outlined" component="label">
            上传图片
            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, setFooterLeftImage)} />
          </Button>
        </Box>
        <TextField
          fullWidth
          label="名称"
          value={footerLeftName}
          onChange={(e) => setFooterLeftName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="描述"
          value={footerLeftDescription}
          onChange={(e) => setFooterLeftDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* 右侧链接配置 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>右侧链接配置</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={addCategory}
            disabled={footerRightCategories.length >= 3}
          >
            添加类别
          </Button>
        </Box>

        {footerRightCategories.map((category, categoryIndex) => (
          <Paper
            key={categoryIndex}
            sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="类别名称"
                value={category.category}
                onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                size="small"
              />
              <IconButton
                color="error"
                onClick={() => removeCategory(categoryIndex)}
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>

            <Box sx={{ mb: 1 }}>
              {category.links.map((link, linkIndex) => (
                <Box key={linkIndex} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    label="链接名称"
                    value={link.title}
                    onChange={(e) => updateLink(categoryIndex, linkIndex, 'title', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="链接地址"
                    value={link.url}
                    onChange={(e) => updateLink(categoryIndex, linkIndex, 'url', e.target.value)}
                    size="small"
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeLink(categoryIndex, linkIndex)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => addLink(categoryIndex)}
            >
              添加链接
            </Button>
          </Paper>
        ))}

        {footerRightCategories.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无类别，点击"添加类别"开始配置
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

