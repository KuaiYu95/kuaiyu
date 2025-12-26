// ===========================================
// 登录页面
// ===========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      setAuth({
        user: res.data.user,
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
      });
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
          快鱼博客
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          管理后台登录
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            autoFocus
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : '登录'}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={3}>
          默认账号: admin / admin123
        </Typography>
      </Paper>
    </Box>
  );
}

