// ===========================================
// 评论区组件
// ===========================================

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Avatar, Loading, Empty } from '@/components/ui';
import { publicApi } from '@/lib/api';

interface Comment {
  id: number;
  nickname: string;
  avatar: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId?: number;
  lifeRecordId?: number;
  isGuestbook?: boolean;
  locale: string;
}

export default function CommentSection({
  postId,
  lifeRecordId,
  isGuestbook,
  locale,
}: CommentSectionProps) {
  const t = useTranslations('comment');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  // 表单状态
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [content, setContent] = useState('');

  // 加载评论
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await publicApi.comments.list({
        post_id: postId,
        life_record_id: lifeRecordId,
        is_guestbook: isGuestbook,
      });
      setComments(res.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, lifeRecordId, isGuestbook]);

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nickname.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      await publicApi.comments.create({
        post_id: postId,
        life_record_id: lifeRecordId,
        is_guestbook: isGuestbook,
        parent_id: replyTo,
        nickname,
        email,
        website,
        content,
      });

      // 清空表单
      setContent('');
      setReplyTo(null);
      // 重新加载评论
      fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染评论
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-12 mt-4' : 'mb-6'}`}
    >
      <div className="flex gap-4">
        <Avatar name={comment.nickname} src={comment.avatar} size={isReply ? 'sm' : 'md'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{comment.nickname}</span>
            {comment.is_admin && (
              <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                {t('admin')}
              </span>
            )}
            <span className="text-gray-500 text-sm">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-300 mb-2">{comment.content}</p>
          <button
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
          >
            {replyTo === comment.id ? t('cancelReply') : t('reply')}
          </button>

          {/* 回复表单 */}
          {replyTo === comment.id && (
            <form onSubmit={handleSubmit} className="mt-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('replyPlaceholder', { name: comment.nickname })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                rows={3}
                required
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" size="sm" loading={submitting}>
                  {t('submitReply')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 子评论 */}
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6">
        {t('title')} ({comments.length})
      </h3>

      {/* 评论表单 */}
      <Card className="mb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('nicknamePlaceholder')}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              required
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t('websitePlaceholder')}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-4"
            rows={4}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {t('submit')}
            </Button>
          </div>
        </form>
      </Card>

      {/* 评论列表 */}
      {loading ? (
        <Loading />
      ) : comments.length > 0 ? (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      ) : (
        <Empty message={t('noComments')} />
      )}
    </div>
  );
}

