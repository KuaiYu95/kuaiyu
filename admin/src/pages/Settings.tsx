// ===========================================
// 系统设置页面
// ===========================================

import { configApi, uploadApi } from '@/lib/api';
import { Save } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';

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
        />
      </Paper>
    </Box>
  );
}

