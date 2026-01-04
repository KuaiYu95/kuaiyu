import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';

// ===========================================
// 暗黑主题配置
// ===========================================

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
      light: '#8b9aff',
      dark: '#4c63d2',
    },
    secondary: {
      main: '#f093fb',
      light: '#ffb3ff',
      dark: '#c264d0',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(26, 26, 26, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "system-ui", "-apple-system", sans-serif',
    fontSize: 14,
    h1: {
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      lineHeight: 1.6,
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.15)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 28px 56px rgba(0, 0, 0, 0.45)',
    '0px 32px 64px rgba(0, 0, 0, 0.5)',
    '0px 36px 72px rgba(0, 0, 0, 0.55)',
    '0px 40px 80px rgba(0, 0, 0, 0.6)',
    '0px 44px 88px rgba(0, 0, 0, 0.65)',
    '0px 48px 96px rgba(0, 0, 0, 0.7)',
    '0px 52px 104px rgba(0, 0, 0, 0.75)',
    '0px 56px 112px rgba(0, 0, 0, 0.8)',
    '0px 60px 120px rgba(0, 0, 0, 0.85)',
    '0px 64px 128px rgba(0, 0, 0, 0.9)',
    '0px 68px 136px rgba(0, 0, 0, 0.95)',
    '0px 72px 144px rgba(0, 0, 0, 1)',
    '0px 76px 152px rgba(0, 0, 0, 1)',
    '0px 80px 160px rgba(0, 0, 0, 1)',
    '0px 84px 168px rgba(0, 0, 0, 1)',
    '0px 88px 176px rgba(0, 0, 0, 1)',
    '0px 92px 184px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            boxShadow: '0px 8px 16px rgba(102, 126, 234, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        elevation1: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
        },
        elevation2: {
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
        },
        elevation3: {
          boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

