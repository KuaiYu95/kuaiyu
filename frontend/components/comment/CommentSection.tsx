'use client';

import { Avatar, Button, Card, Empty, Loading } from '@/components/ui';
import { publicApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface Comment {
  id: number;
  nickname: string;
  email?: string;
  avatar: string;
  content: string;
  status: string;
  is_admin: boolean;
  is_pinned?: boolean;
  created_at: string;
  parent_id?: number;
  parent_nickname?: string;
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
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyToNickname, setReplyToNickname] = useState<string>('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [hasStoredUserInfo, setHasStoredUserInfo] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kuaiyu_comment_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setNickname(user.nickname || '');
          setEmail(user.email || '');
          setWebsite(user.website || '');
          setHasStoredUserInfo(true);
        } catch (e) { }
      }
    }
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const userEmail = email || localStorage.getItem('kuaiyu_comment_email') || '';
      const res = await publicApi.comments.list({
        post_id: postId,
        life_record_id: lifeRecordId,
        is_guestbook: isGuestbook,
        email: userEmail,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentContent = replyTo ? replyContent : content;
    if (!currentContent.trim() || !nickname.trim() || !email.trim()) return;

    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      const res = await publicApi.comments.create({
        post_id: postId,
        life_record_id: lifeRecordId,
        is_guestbook: isGuestbook,
        parent_id: replyTo || undefined,
        reply_to_id: replyToCommentId || undefined,
        nickname,
        email,
        website,
        content: currentContent,
      });

      localStorage.setItem('kuaiyu_comment_user', JSON.stringify({ nickname, email, website }));
      localStorage.setItem('kuaiyu_comment_email', email);
      setHasStoredUserInfo(true);

      setIsPending(res.data?.status === 'pending');
      setSubmitSuccess(true);

      if (replyTo) {
        setReplyContent('');
      } else {
        setContent('');
      }
      setReplyTo(null);

      setTimeout(() => fetchComments(), 500);
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

  const renderComment = (comment: Comment, isReply = false, parentId?: number) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-12 mt-4' : 'mb-6'}`}
    >
      <div className="flex gap-4">
        <Avatar name={comment.nickname} src={comment.avatar} size={isReply ? 'sm' : 'md'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {!isReply && comment.is_pinned && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                </svg>
                置顶
              </span>
            )}
            <span className="font-medium text-white">{comment.nickname}</span>
            {comment.parent_nickname && (
              <span className="text-gray-400 text-sm">
                回复 <span className="text-primary-400">@{comment.parent_nickname}</span>
              </span>
            )}
            {comment.is_admin && (
              <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                {t('admin')}
              </span>
            )}
            {comment.status === 'pending' && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                {t('pending')}
              </span>
            )}
            <span className="text-gray-500 text-sm">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-300 mb-2">{comment.content}</p>
          <button
            onClick={() => {
              if (replyTo === (isReply && parentId ? parentId : comment.id)) {
                setReplyTo(null);
                setReplyToCommentId(null);
                setReplyContent('');
                setReplyToNickname('');
              } else {
                setReplyTo(isReply && parentId ? parentId : comment.id);
                setReplyToCommentId(comment.id);
                setReplyToNickname(comment.nickname);
              }
            }}
            className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
          >
            {(replyTo === (isReply && parentId ? parentId : comment.id) && replyToCommentId === comment.id) ? t('cancelReply') : t('reply')}
          </button>

          {((replyTo === comment.id && replyToCommentId === comment.id) || (isReply && replyTo === parentId && replyToCommentId === comment.id)) && (
            <form onSubmit={handleSubmit} className="mt-4 p-4 bg-bg-secondary rounded-lg border border-border">
              <div className="mb-4 p-3 bg-dark-800/50 rounded border-l-2 border-primary-500">
                <div className="text-sm text-gray-400 mb-1">回复 @{replyToNickname}</div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('nicknamePlaceholder')}
                  className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={hasStoredUserInfo}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={hasStoredUserInfo}
                />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={t('websitePlaceholder')}
                  className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('replyPlaceholder', { name: comment.nickname })}
                className="w-full px-4 py-3 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-4"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={submitting}>
                  {t('submitReply')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => renderComment(reply, true, comment.id))}
    </div>
  );

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6">
        {t('title')} ({comments.length})
      </h3>

      {submitSuccess && (
        <div className={`mb-4 p-4 rounded-lg ${isPending ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <p className={isPending ? 'text-yellow-400' : 'text-green-400'}>
            {isPending ? t('pendingTip') : t('successTip')}
          </p>
        </div>
      )}

      <Card className="mb-8" hoverable={false}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('nicknamePlaceholder')}
              className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={hasStoredUserInfo}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={hasStoredUserInfo}
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t('websitePlaceholder')}
              className="px-4 py-2 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className="w-full px-4 py-3 bg-transparent border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-4"
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

      {loading ? (
        <Loading />
      ) : comments.length > 0 ? (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      ) : (
        <Empty title={t('noComments')} />
      )}
    </div>
  );
}

