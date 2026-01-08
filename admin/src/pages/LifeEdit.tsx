// ===========================================
// 生活记录编辑页面
// ===========================================

import MarkdownEditor from '@/components/MarkdownEditor';
import { ArrowBackIcon, ArticleIcon, PhotoIcon } from '@/components/icons';
import { lifeApi, uploadApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Stack,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LifeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 表单数据（生活记录没有标题，只有内容）
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      lifeApi
        .get(parseInt(id!))
        .then((res) => {
          const record = res.data;
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
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 1, sm: 2 }, flexShrink: 0 }}>
          <Stack direction={'row'} alignItems={'center'}>
            <Button
              startIcon={<ArrowBackIcon size={14} />}
              onClick={() => navigate(ROUTES.LIFE)}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              返回
            </Button>
            <Box sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>生活记录</Box>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} gap={{ xs: 1, sm: 2 }}>
            <Button
              variant={status === 'published' ? 'contained' : 'outlined'}
              startIcon={status === 'published' ? <CheckBox /> : <CheckBoxOutlineBlank />}
              onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
              size="small"
              sx={{
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '6px 8px', sm: '6px 12px' },
                minWidth: { xs: 'auto', sm: 'auto' },
                ...(status === 'published'
                  ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0px 8px 16px rgba(102, 126, 234, 0.4)',
                    },
                  }
                  : {
                    color: 'text.secondary',
                    borderColor: 'divider',
                  }),
              }}
            >
              发布
            </Button>
            <Button
              variant={coverImage ? "contained" : "outlined"}
              startIcon={<PhotoIcon size={18} hover />}
              onClick={() => {
                if (coverImage) {
                  setPreviewOpen(true);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              size="small"
              sx={{
                flexShrink: 0,
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 1, sm: 2 },
                '& .MuiButton-startIcon': {
                  margin: { xs: 0, sm: '0 4px 0 -4px' },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                上传封面
              </Box>
            </Button>
            <Button
              variant="contained"
              startIcon={<ArticleIcon size={18} hover />}
              disabled={saving}
              onClick={handleSubmit}
              size="small"
              sx={{
                flexShrink: 0,
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 1, sm: 2 },
                '& .MuiButton-startIcon': {
                  margin: { xs: 0, sm: '0 4px 0 -4px' },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {saving ? '保存中...' : '保存'}
              </Box>
            </Button>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height={0} // 使用 flex 布局，不需要固定高度
            fullscreen={true}
          />
        </Box>
      </Box>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <Dialog
        open={previewOpen}
        maxWidth={false}
        PaperProps={{
          sx: {
            m: 0,
            position: 'relative',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        onClose={() => setPreviewOpen(false)}
        onClick={() => setPreviewOpen(false)}
      >
        <Box
          sx={{
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <Button
          variant="contained"
          startIcon={<PhotoIcon size={18} hover />}
          onClick={(e) => {
            e.stopPropagation();
            setPreviewOpen(false);
            fileInputRef.current?.click();
          }}
          size="small"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '20px',
            zIndex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0px 8px 16px rgba(102, 126, 234, 0.4)',
            },
          }}
        >
          更换封面
        </Button>
      </Dialog>
    </>
  );
}
