// ===========================================
// Markdown 预览组件（使用 @uiw/react-md-editor）
// ===========================================

'use client';

import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useState } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  // 处理 SSR：只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // SSR 时返回占位内容，避免样式闪烁
    return (
      <div className={className}>
        <div className="w-full min-h-[400px] animate-pulse bg-gray-800/20 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={className} data-color-mode="dark">
      <MDEditor.Markdown
        source={content}
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
        }}
      />
    </div>
  );
}
