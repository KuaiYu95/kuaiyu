// ===========================================
// 命令面板组件 (Cmd+K)
// ===========================================

import React from 'react';
import { MENU_ITEMS, ROUTES } from '@/lib/constants';
import {
  Analytics,
  Article,
  Close,
  Comment,
  Label,
  PhotoCamera,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

interface CommandPanelProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Article: <Article />,
  PhotoCamera: <PhotoCamera />,
  Comment: <Comment />,
  Label: <Label />,
  Analytics: <Analytics />,
};

export default function CommandPanel({ open, onClose }: CommandPanelProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  // 注册快捷键
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    if (open) {
      onClose();
    } else {
      // 通过外部控制打开
    }
  });

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Search sx={{ mr: 1, color: 'text.secondary' }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="搜索页面或操作..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              fontSize: '1rem',
              '& input': {
                color: 'text.primary',
              },
            }}
          />
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(item.path)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    {iconMap[item.icon]}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">未找到匹配项</Typography>
            </Box>
          )}
        </List>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              ↑↓
            </kbd>{' '}
            导航
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              Enter
            </kbd>{' '}
            选择
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              Esc
            </kbd>{' '}
            关闭
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

