// ===========================================
// 用户信息弹框组件（包含修改密码功能）
// ===========================================

import { authApi } from '@/lib/api';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface UserInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function UserInfoDialog({ open, onClose }: UserInfoDialogProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码至少需要6个字符');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccess('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // 3秒后自动关闭弹框
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>修改信息</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>修改密码</Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label="当前密码"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="current-password"
          />

          <TextField
            fullWidth
            type="password"
            label="新密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="new-password"
            helperText="密码至少需要6个字符"
          />

          <TextField
            fullWidth
            type="password"
            label="确认新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleChangePassword}
          disabled={saving}
        >
          {saving ? '修改中...' : '修改密码'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

