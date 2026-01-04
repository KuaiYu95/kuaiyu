// ===========================================
// 浮动操作按钮 (FAB)
// ===========================================

import { ROUTES } from '@/lib/constants';
import { Add, Save } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路由决定显示的操作
  const getAction = () => {
    if (location.pathname.includes('/posts')) {
      if (location.pathname.includes('/new') || location.pathname.match(/\/posts\/\d+/)) {
        return {
          icon: <Save />,
          label: '保存',
          action: onClick || (() => {}),
        };
      }
      return {
        icon: <Add />,
        label: '新建文章',
        action: () => navigate(ROUTES.POST_NEW),
      };
    }
    if (location.pathname.includes('/life')) {
      if (location.pathname.includes('/new') || location.pathname.match(/\/life\/\d+/)) {
        return {
          icon: <Save />,
          label: '保存',
          action: onClick || (() => {}),
        };
      }
      return {
        icon: <Add />,
        label: '新建记录',
        action: () => navigate(ROUTES.LIFE_NEW),
      };
    }
    return null;
  };

  const action = getAction();

  if (!action) return null;

  return (
    <Tooltip title={action.label} placement="left">
      <Fab
        color="primary"
        onClick={action.action}
        sx={{
          position: 'fixed',
          bottom: { xs: 80, sm: 24 },
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            transform: 'scale(1.1)',
            boxShadow: '0px 8px 24px rgba(102, 126, 234, 0.4)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {action.icon}
      </Fab>
    </Tooltip>
  );
}

