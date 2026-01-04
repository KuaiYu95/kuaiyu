// ===========================================
// Markdown 编辑器组件 (react-markdown-editor-lite)
// ===========================================

import { uploadApi } from '@/lib/api';
import { Box } from '@mui/material';
import { useCallback } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始输入...',
  height = 500,
}: MarkdownEditorProps) {
  const handleImageUpload = useCallback(async (file: File, callback: (url: string) => void) => {
    try {
      const res = await uploadApi.upload(file);
      callback(res.data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }, []);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '& .rc-md-editor': {
          border: 'none',
          bgcolor: 'background.paper',
        },
        '& .rc-md-editor .editor-container .section-container': {
          bgcolor: 'background.paper',
        },
        '& .rc-md-editor .editor-container .section-container .section': {
          bgcolor: 'background.paper',
          color: 'text.primary',
        },
        '& .rc-md-editor .editor-container .section-container .section .input': {
          bgcolor: 'background.paper',
          color: 'text.primary',
        },
        '& .rc-md-editor .editor-container .section-container .section .html-wrap': {
          bgcolor: 'background.paper',
          color: 'text.primary',
        },
      }}
    >
      <MdEditor
        value={value}
        style={{ height: `${height}px` }}
        onChange={({ text }) => onChange(text)}
        placeholder={placeholder}
        onImageUpload={handleImageUpload}
        renderHTML={(text) => {
          // 简单的 markdown 渲染，可以后续集成更好的渲染器
          return text;
        }}
        view={{ menu: true, md: true, html: true }}
        canView={{ menu: true, md: true, html: true, fullScreen: true, hideMenu: false }}
      />
    </Box>
  );
}
