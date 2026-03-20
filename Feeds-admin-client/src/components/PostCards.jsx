import { useState } from "react";
import {
  Archive,
  RotateCcw,
  Calendar,
  Heart,
  ThumbsDown,
  AlertTriangle,
  User,
  Globe,
  Lock,
  PlayCircle,
  Image as ImageIcon,
  Trash2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import "../styles/postManagement.css";

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = dateValue.$date ? new Date(dateValue.$date) : new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getMediaPreview = (post) => {
  if (!post?.url) return null;
  const lowerUrl = post.url.toLowerCase();
  const looksLikeVideo =
    post.type === "Reels" ||
    lowerUrl.endsWith(".mp4") ||
    lowerUrl.endsWith(".webm") ||
    lowerUrl.endsWith(".mov");

  return looksLikeVideo ? (
    <video className="post-media" src={post.url} controls preload="metadata" />
  ) : (
    <img className="post-media" src={post.url} alt={post.content || post.id} />
  );
};

export default function PostCards({
  posts,
  loading,
  emptyMessage,
  onToggleArchive,
  onDeletePost,
  actionLoadingId,
  fetchComments,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) {
  const [expandedPosts, setExpandedPosts] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsPaginationByPost, setCommentsPaginationByPost] = useState({});
  const [commentsLoadingId, setCommentsLoadingId] = useState(null);

  const sortedPosts = [...(posts || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const loadComments = async (post, page = 1, append = false) => {
    if (!fetchComments) return;

    const postKey = post._id || post.id;
    setCommentsLoadingId(postKey);

    try {
      const data = await fetchComments(post, page);
      setCommentsByPost((current) => ({
        ...current,
        [postKey]: append
          ? [...(current[postKey] || []), ...(data.comments || [])]
          : data.comments || [],
      }));
      setCommentsPaginationByPost((current) => ({
        ...current,
        [postKey]: data.pagination || {},
      }));
    } catch (error) {
      console.error("Error loading comments:", error);
      setCommentsByPost((current) => ({
        ...current,
        [postKey]: [],
      }));
    } finally {
      setCommentsLoadingId(null);
    }
  };

  const handleToggleComments = async (post) => {
    const postKey = post._id || post.id;
    const nextExpanded = !expandedPosts[postKey];

    setExpandedPosts((current) => ({
      ...current,
      [postKey]: nextExpanded,
    }));

    if (nextExpanded && fetchComments && !commentsByPost[postKey]) {
      await loadComments(post, 1, false);
    }
  };

  if (loading) {
    return (
      <div className="post-state">
        <div className="spinner" />
        <p>Loading posts...</p>
      </div>
    );
  }

  if (!sortedPosts.length) {
    return (
      <div className="post-state">
        <ImageIcon size={42} color="#94a3b8" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="post-list-shell">
      <div className="posts-grid">
        {sortedPosts.map((post) => {
          const postKey = post._id || post.id;
          const isExpanded = !!expandedPosts[postKey];
          const comments = commentsByPost[postKey] || [];
          const commentPagination = commentsPaginationByPost[postKey] || {};
          const isActionLoading = actionLoadingId === postKey;
          const isCommentsLoading = commentsLoadingId === postKey;

          return (
            <article
              key={postKey}
              className={`post-card ${post.isArchived ? "archived" : ""}`}
            >
              <div className="post-card-header">
                <div className="post-header-copy">
                  <div className="post-type-row">
                    <div className="post-type-pill">
                      {post.type === "Reels" ? <PlayCircle size={14} /> : <ImageIcon size={14} />}
                      <span>{post.type || "Post"}</span>
                    </div>
                    {post.isArchived && <div className="post-status-chip">Archived</div>}
                  </div>
                  <h4 className="post-id-text">{post.id || post._id}</h4>
                </div>
              </div>

              <div className="post-media-shell">
                {getMediaPreview(post) || (
                  <div className="post-media-fallback">
                    {post.type === "Reels" ? <PlayCircle size={28} /> : <ImageIcon size={28} />}
                  </div>
                )}
              </div>

              <p className="post-content-text">{post.content || "No caption available."}</p>

              <div className="post-meta">
                <span>
                  <User size={14} />
                  @{post.author || "unknown"}
                </span>
                <span>
                  {post.ispublic ? <Globe size={14} /> : <Lock size={14} />}
                  {post.ispublic ? "Public" : "Private"}
                </span>
                <span>
                  <Calendar size={14} />
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <div className="post-stats-row">
                <span>
                  <Heart size={14} />
                  {post.likes || 0} likes
                </span>
                <span>
                  <ThumbsDown size={14} />
                  {post.dislikes || 0} dislikes
                </span>
                <span>
                  <AlertTriangle size={14} />
                  {post.warnings || 0} warnings
                </span>
                <span>
                  <MessageSquare size={14} />
                  {post.commentsCount || 0} comments
                </span>
              </div>

              <div className="post-actions-row">
                <button
                  type="button"
                  className={`post-action-button ${post.isArchived ? "restore" : "archive"}`}
                  onClick={() => onToggleArchive?.(post)}
                  disabled={!onToggleArchive || isActionLoading}
                >
                  {post.isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
                  <span>{isActionLoading ? "Saving..." : post.isArchived ? "Restore" : "Archive"}</span>
                </button>

                <button
                  type="button"
                  className="post-action-button comments"
                  onClick={() => handleToggleComments(post)}
                  disabled={!fetchComments}
                >
                  <MessageSquare size={16} />
                  <span>{isExpanded ? "Hide Comments" : "Show Comments"}</span>
                </button>

                <button
                  type="button"
                  className="post-action-button delete"
                  onClick={() => onDeletePost?.(post)}
                  disabled={!onDeletePost || isActionLoading}
                >
                  <Trash2 size={16} />
                  <span>{isActionLoading ? "Deleting..." : "Delete"}</span>
                </button>
              </div>

              {isExpanded && (
                <div className="post-comments-panel">
                  <div className="post-comments-header">
                    <h5>Comments</h5>
                    <span>{post.commentsCount || 0} total</span>
                  </div>

                  {isCommentsLoading && comments.length === 0 ? (
                    <div className="post-comments-empty">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="post-comments-empty">No comments on this post.</div>
                  ) : (
                    <div className="post-comments-list">
                      {comments.map((comment) => (
                        <div key={comment._id} className="post-comment-card">
                          <div className="post-comment-top">
                            <div className="post-comment-user">
                              <img
                                src={
                                  comment.avatarUrl ||
                                  "https://api.dicebear.com/7.x/avataaars/svg?seed=comment"
                                }
                                alt={comment.username}
                                className="post-comment-avatar"
                              />
                              <div>
                                <div className="post-comment-name">
                                  {comment.username || "Unknown"}
                                </div>
                                <div className="post-comment-date">
                                  {formatDate(comment.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div className="post-comment-likes">
                              <Heart size={12} />
                              {comment.likes?.length || 0}
                            </div>
                          </div>
                          <p className="post-comment-text">{comment.text}</p>
                          <div className="post-comment-meta">
                            <span>{comment.reply_array?.length || 0} replies</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {commentPagination.hasMore && (
                    <button
                      type="button"
                      className="post-load-more-button subtle"
                      onClick={() =>
                        loadComments(post, (commentPagination.page || 1) + 1, true)
                      }
                      disabled={isCommentsLoading}
                    >
                      <ChevronDown size={16} />
                      <span>{isCommentsLoading ? "Loading..." : "Load more comments"}</span>
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="post-load-more-wrap">
          <button
            type="button"
            className="post-load-more-button"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            <ChevronDown size={16} />
            <span>{loadingMore ? "Loading..." : "Load more posts"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
