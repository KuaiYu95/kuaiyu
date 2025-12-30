'use client';

import httpAnimation from '@/assets/icons/system-regular-142-http-hover-http.json';
import bookmarkAnimation from '@/assets/icons/system-regular-20-bookmark-hover-bookmark-1.json';
import chatAnimation from '@/assets/icons/system-regular-47-chat-hover-chat.json';
import { Avatar, Button, Card, Empty, Loading, Lottie, RelativeTime } from '@/components/ui';
import { publicApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ReplyButton from './ReplyButton';

interface Comment {
  id: number;
  nickname: string;
  email?: string;
  website?: string;
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

  const fetchComments = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const userEmail = email || localStorage.getItem('kuaiyu_comment_email') || '';

      // 确定评论类型和目标ID
      let commentType: 'post' | 'life' | 'guestbook' | undefined;
      let targetId: number | undefined;

      if (isGuestbook) {
        commentType = 'guestbook';
        targetId = undefined;
      } else if (postId) {
        commentType = 'post';
        targetId = postId;
      } else if (lifeRecordId) {
        commentType = 'life';
        targetId = lifeRecordId;
      }

      const res = await publicApi.comments.list({
        comment_type: commentType,
        target_id: targetId,
        // 向后兼容参数
        post_id: postId,
        life_record_id: lifeRecordId,
        is_guestbook: isGuestbook,
        email: userEmail,
      });
      setComments(res.data || []);
      return res.data || [];
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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
      // 确定评论类型和目标ID
      let commentType: 'post' | 'life' | 'guestbook' | undefined;
      let targetId: number | undefined;

      if (isGuestbook) {
        commentType = 'guestbook';
        targetId = undefined;
      } else if (postId) {
        commentType = 'post';
        targetId = postId;
      } else if (lifeRecordId) {
        commentType = 'life';
        targetId = lifeRecordId;
      }

      const res = await publicApi.comments.create({
        comment_type: commentType,
        target_id: targetId,
        // 向后兼容参数
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

      const isPendingStatus = res.data?.status === 'pending';
      setIsPending(isPendingStatus);
      setSubmitSuccess(true);

      if (replyTo) {
        setReplyContent('');
      } else {
        setContent('');
      }
      setReplyTo(null);

      if (isPendingStatus) {
        setTimeout(() => fetchComments(true), 500);
      } else {
        const newCommentId = res.data?.id;
        await fetchComments(false);
        if (newCommentId) {
          setTimeout(() => {
            const element = document.getElementById(`comment-${newCommentId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('animate-pulse');
              setTimeout(() => element.classList.remove('animate-pulse'), 2000);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false, parentId?: number) => (
    <div
      key={comment.id}
      id={`comment-${comment.id}`}
      className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} transition-all duration-300`}
    >
      <div className="flex gap-4">
        <Avatar name={comment.nickname} src={comment.avatar} isAdmin={comment.is_admin} size='lg' />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {!isReply && comment.is_pinned && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                <Lottie
                  animationData={bookmarkAnimation}
                  width={12}
                  height={12}
                  loop={false}
                  autoplay={true}
                />
                {t('pinned')}
              </span>
            )}
            {comment.website ? (
              <a
                href={comment.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white hover:text-primary-400 transition-colors cursor-pointer underline-offset-2 hover:underline flex items-center gap-1"
                title={comment.website}
              >
                {comment.nickname}
                <Lottie
                  animationData={httpAnimation}
                  width={24}
                  height={24}
                  loop={false}
                  autoplay={true}
                />
              </a>
            ) : (
              <span className="font-medium text-white">{comment.nickname}</span>
            )}
            {comment.parent_nickname && (
              <span className="text-gray-400 text-sm">
                {t('replyTo')} <span className="text-primary-400">@{comment.parent_nickname}</span>
              </span>
            )}
            {comment.is_admin && (
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('admin')}
              </span>
            )}
            {comment.status === 'pending' && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                {t('pending')}
              </span>
            )}
            <span className="text-gray-500 text-sm">
              <RelativeTime date={comment.created_at} locale={locale} />
            </span>
          </div>
          <p className="text-gray-300 mb-2">{comment.content}</p>
          <ReplyButton
            isActive={
              (replyTo === (isReply && parentId ? parentId : comment.id) && replyToCommentId === comment.id)
            }
            replyText={t('reply')}
            cancelText={t('cancelReply')}
            onClick={() => {
              if (replyTo === (isReply && parentId ? parentId : comment.id)) {
                setReplyTo(null);
                setReplyToCommentId(null);
                setReplyContent('');
              } else {
                setReplyTo(isReply && parentId ? parentId : comment.id);
                setReplyToCommentId(comment.id);
              }
            }}
          />

          {replyToCommentId === comment.id && (
            <form onSubmit={handleSubmit} className="mt-4 p-4 bg-bg-secondary rounded-lg border border-border">
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
      <div className="flex items-center gap-3 mb-6">
        <Lottie
          animationData={chatAnimation}
          width={16}
          height={16}
          autoplay={true}
        />
        <h3 className="text-xl font-bold text-white">
          {t('title')} ({comments.length})
        </h3>
      </div>

      {submitSuccess && isPending && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-400">
            {t('pendingTip')}
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
            rows={2}
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

