// ===========================================
// 生活记录编辑页面
// ===========================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';
import { lifeApi, uploadApi, type LifeRecord } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function LifeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 表单数据
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      lifeApi
        .get(parseInt(id!))
        .then((res) => {
          const record = res.data;
          setTitle(record.title);
          setContent(record.content);
          setCoverImage(record.cover_image);
          setStatus(record.status);
        })
        .catch(() => {
          setError('加载记录失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = {
      title,
      content,
      cover_image: coverImage,
      status,
    };

    try {
      if (isEdit) {
        await lifeApi.update(parseInt(id!), data);
      } else {
        await lifeApi.create(data);
      }
      navigate(ROUTES.LIFE);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadApi.upload(file);
      setCoverImage(res.data.url);
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTES.LIFE)}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h5" fontWeight="bold">
          {isEdit ? '编辑记录' : '新建记录'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* 左侧主内容 */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }} elevation={0}>
              <TextField
                fullWidth
                label="标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                内容
              </Typography>
              <Box data-color-mode="dark">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height={500}
                />
              </Box>
            </Paper>
          </Box>

          {/* 右侧设置 */}
          <Box sx={{ width: 300 }}>
            <Paper sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                发布设置
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  value={status}
                  label="状态"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="draft">草稿</MenuItem>
                  <MenuItem value="published">发布</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<Save />}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
            </Paper>

            <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                封面图
              </Typography>
              {coverImage && (
                <Box
                  component="img"
                  src={coverImage}
                  sx={{ width: '100%', borderRadius: 1, mb: 2 }}
                />
              )}
              <Button variant="outlined" component="label" fullWidth>
                上传图片
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Paper>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
