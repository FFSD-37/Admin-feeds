import { useContext, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Archive,
  RotateCcw,
  Images,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import PostCards from "./PostCards";
import "../styles/postManagement.css";

const PAGE_LIMIT = 9;

const PostsPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [channelPosts, setChannelPosts] = useState([]);

  const fetchRegularPosts = async (targetPage = 1, query = "") => {
    const rawQuery = query.trim();
    const searchParam = rawQuery ? `&search=${encodeURIComponent(rawQuery)}` : "";
    const res = await fetch(
      `http://localhost:8080/post/list?page=${targetPage}&limit=${PAGE_LIMIT}${searchParam}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.json();
  };

  const fetchChannelPosts = async (targetPage = 1, query = "") => {
    const rawQuery = query.trim();
    const searchParam = rawQuery ? `&search=${encodeURIComponent(rawQuery)}` : "";
    const res = await fetch(
      `http://localhost:8080/post/channel/list?page=${targetPage}&limit=${PAGE_LIMIT}${searchParam}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.json();
  };

  const fetchPosts = async (targetPage = 1) => {
    setLoading(true);

    try {
      const [regularData, channelData] = await Promise.all([
        fetchRegularPosts(targetPage, searchQuery),
        fetchChannelPosts(targetPage, searchQuery),
      ]);

      const regularPosts = regularData.success ? regularData.posts || [] : [];
      const channelPostsResponse = channelData.success ? channelData.posts || [] : [];

      const combined = [...regularPosts, ...channelPostsResponse].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(combined);

      const regularPagination = regularData.pagination || { page: targetPage, totalPages: 1, total: regularPosts.length, hasMore: false };
      const channelPagination = channelData.pagination || { page: targetPage, totalPages: 1, total: channelPostsResponse.length, hasMore: false };

      setPagination({
        page: targetPage,
        totalPages: Math.max(regularPagination.totalPages, channelPagination.totalPages),
        total: (regularPagination.total || 0) + (channelPagination.total || 0),
        hasMore: regularPagination.hasMore || channelPagination.hasMore,
      });

      if (!regularData.success || !channelData.success) {
        alert("Error fetching some posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  const searchActive = searchQuery.trim().length > 0;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts(page);
  }, [page, searchQuery]);

  const handleToggleArchive = async (post) => {
    const postKey = post._id || post.id;
    setActionLoadingId(postKey);
    const isChannelPost = Boolean(post.channel);

    try {
      const endpoint = post.isArchived
        ? isChannelPost
          ? `http://localhost:8080/post/channel-post/${post._id}/restore`
          : `http://localhost:8080/post/${post._id}/restore`
        : isChannelPost
        ? `http://localhost:8080/post/channel-post/${post._id}/archive`
        : `http://localhost:8080/post/${post._id}/archive`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.msg || "Unable to update post");
      }

      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          (currentPost._id || currentPost.id) === postKey
            ? { ...currentPost, isArchived: !currentPost.isArchived }
            : currentPost
        )
      );
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Could not update post status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (post) => {
    const postKey = post._id || post.id;
    setActionLoadingId(postKey);

    try {
      const isChannelPost = Boolean(post.channel);
      const endpoint = isChannelPost
        ? `http://localhost:8080/post/channel-post/${post._id}`
        : `http://localhost:8080/post/${post._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.msg || "Unable to delete post");
      }

      setPosts((currentPosts) =>
        currentPosts.filter((currentPost) => (currentPost._id || currentPost.id) !== postKey)
      );
      setPagination((current) => ({
        ...current,
        total: Math.max(0, (current.total || 0) - 1),
      }));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Could not delete post");
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchComments = async (post, commentsPage = 1) => {
    const isChannelPost = Boolean(post.channel);
    const endpoint = isChannelPost
      ? `http://localhost:8080/post/channel-post/${post._id}/comments?page=${commentsPage}&limit=5`
      : `http://localhost:8080/post/${post._id}/comments?page=${commentsPage}&limit=5`;

    const res = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || data.msg || "Unable to fetch comments");
    }
    return data;
  };

  const filteredPosts = useMemo(() => {
    return (posts || []).filter((post) => {
      if (filterType === "active" && post.isArchived) return false;
      if (filterType === "archived" && !post.isArchived) return false;
      if (filterType === "reels" && post.type !== "Reels") return false;
      if (filterType === "images" && post.type !== "Img") return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (post.author || "").toLowerCase().includes(query) ||
        (post.content || "").toLowerCase().includes(query) ||
        (post.id || "").toLowerCase().includes(query)
      );
    });
  }, [filterType, posts, searchQuery]);

  const stats = {
    total: pagination.total || 0,
    active: posts.filter((post) => !post.isArchived).length,
    archived: posts.filter((post) => post.isArchived).length,
    reels: posts.filter((post) => post.type === "Reels").length,
    images: posts.filter((post) => post.type === "Img").length,
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="header">
          <div className="header-right">
            <div className="user-info">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bonnie"
                alt="User"
                className="user-avatar"
              />
              <span className="user-name">{user.username}</span>
            </div>
          </div>
        </div>

        <div className="content-area">
          <div className="posts-page-header">
            <div>
              <h2 className="posts-page-title">Post Management</h2>
              <p className="posts-page-subtitle">
                Review content, show comments, and archive, restore, or delete posts.
              </p>
            </div>

            <label className="posts-search-box">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search by author, caption or post ID..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="posts-summary-grid">
            <div className="posts-summary-card">
              <FileText size={22} />
              <div>
                <div className="posts-summary-label">Total Posts</div>
                <div className="posts-summary-value">{stats.total}</div>
              </div>
            </div>
            <div className="posts-summary-card">
              <Images size={22} />
              <div>
                <div className="posts-summary-label">Images On Page</div>
                <div className="posts-summary-value">{stats.images}</div>
              </div>
            </div>
            <div className="posts-summary-card">
              <Archive size={22} />
              <div>
                <div className="posts-summary-label">Archived On Page</div>
                <div className="posts-summary-value">{stats.archived}</div>
              </div>
            </div>
            <div className="posts-summary-card">
              <RotateCcw size={22} />
              <div>
                <div className="posts-summary-label">Active On Page</div>
                <div className="posts-summary-value">{stats.active}</div>
              </div>
            </div>
          </div>

          <div className="posts-filter-row">
            <button
              className={`posts-filter-button ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`posts-filter-button ${filterType === "active" ? "active" : ""}`}
              onClick={() => setFilterType("active")}
            >
              Active
            </button>
            <button
              className={`posts-filter-button ${filterType === "archived" ? "active" : ""}`}
              onClick={() => setFilterType("archived")}
            >
              Archived
            </button>
            <button
              className={`posts-filter-button ${filterType === "reels" ? "active" : ""}`}
              onClick={() => setFilterType("reels")}
            >
              Reels
            </button>
            <button
              className={`posts-filter-button ${filterType === "images" ? "active" : ""}`}
              onClick={() => setFilterType("images")}
            >
              Images
            </button>
          </div>

          <PostCards
            posts={filteredPosts}
            loading={loading}
            emptyMessage="No posts match the current filter."
            onToggleArchive={handleToggleArchive}
            onDeletePost={handleDeletePost}
            actionLoadingId={actionLoadingId}
            fetchComments={fetchComments}
          />

          {!searchActive && (
            <div className="pagination-row">
              <button
                type="button"
                className="pagination-button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="pagination-status">
                Page {pagination.page || page} of {pagination.totalPages || 1}
              </div>

              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages || current, current + 1)
                  )
                }
                disabled={page >= (pagination.totalPages || 1) || loading}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
