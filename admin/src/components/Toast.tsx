// ===========================================
// 全局提示组件
// ===========================================

import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useState } from 'react';

// ===========================================
// 类型定义
// ===========================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ===========================================
// Context
// ===========================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ===========================================
// Provider
// ===========================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [duration, setDuration] = useState(1500);

  const showToast = useCallback((options: ToastOptions) => {
    setMessage(options.message);
    setType(options.type || 'success');
    setDuration(options.duration || 1500);
    setOpen(true);
  }, []);

  const success = useCallback(
    (message: string, duration = 1500) => {
      showToast({ message, type: 'success', duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration = 1500) => {
      showToast({ message, type: 'error', duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration = 1500) => {
      showToast({ message, type: 'warning', duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration = 1500) => {
      showToast({ message, type: 'info', duration });
    },
    [showToast]
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={type} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

// ===========================================
// Hook
// ===========================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast 必须在 ToastProvider 内使用');
  }
  return context;
}

