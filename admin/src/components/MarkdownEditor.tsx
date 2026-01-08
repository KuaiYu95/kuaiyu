// ===========================================
// Markdown 编辑器组件 (@uiw/react-md-editor)
// ===========================================

import { Box } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useEffect, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  fullscreen?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  fullscreen = false,
}: MarkdownEditorProps) {
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: fullscreen ? '100%' : `${height}px`,
        '& .w-md-editor': {
          height: '100%',
        },
        '& .w-md-editor-text': {
          minHeight: '100% !important',
        },
      }}
      data-color-mode="dark"
    >
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview={isMobile ? 'edit' : 'live'}
        visibleDragbar={!isMobile}
        height={fullscreen ? '100%' : height}
        data-color-mode="dark"
      />
    </Box>
  );
}
