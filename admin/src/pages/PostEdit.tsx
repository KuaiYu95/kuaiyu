// ===========================================
// 文章编辑页面
// ===========================================

import { ArrowBackIcon, ArticleIcon, PhotoIcon } from '@/components/icons';
import MarkdownEditor from '@/components/MarkdownEditor';
import { postApi, tagApi, uploadApi, type Tag } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);

  // 表单数据
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 获取标签列表
    tagApi.list().then((res) => setTags(res.data));

    // 如果是编辑模式，获取文章详情
    if (isEdit) {
      setLoading(true);
      postApi
        .get(parseInt(id!))
        .then((res) => {
          const post = res.data;
          setTitle(post.title);
          setContent(post.content);
          setCoverImage(post.cover_image);
          setStatus(post.status);
          setSelectedTags(post.tags || []);
        })
        .catch(() => {
          setError('加载文章失败');
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
      excerpt: '', // 摘要留空，由后端自动生成
      cover_image: coverImage,
      status,
      tag_ids: selectedTags.map((t) => t.id),
    };

    try {
      if (isEdit) {
        await postApi.update(parseInt(id!), data);
      } else {
        await postApi.create(data);
      }
      navigate(ROUTES.POSTS);
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
      // 重置 input，允许再次选择同一文件
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
              onClick={() => navigate(ROUTES.POSTS)}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              返回
            </Button>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="点击此处填写标题"
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 'bold',
                '& .MuiInputBase-input': {
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 'bold',
                  padding: 0,
                },
              }}
            />
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
              onClick={() => navigate(ROUTES.POST_NEW)}
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
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
            {tags.map((tag) => {
              const isSelected = selectedTags.some((selectedTag) => selectedTag.id === tag.id);
              return (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  size="small"
                  sx={{
                    cursor: 'pointer',
                    ...(isSelected && {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        boxShadow: '0px 4px 8px rgba(102, 126, 234, 0.4)',
                      },
                    }),
                  }}
                />
              );
            })}
          </Box>
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
            backgroundColor: 'transparent',
            boxShadow: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
          },
        }}
        onClose={() => setPreviewOpen(false)}
        onClick={() => setPreviewOpen(false)}
      >
        <Box
          component="img"
          src={coverImage}
          alt="封面预览"
          sx={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Dialog>
    </>
  );
}

