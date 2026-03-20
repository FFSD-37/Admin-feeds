import { useState, useEffect, useContext, useMemo } from "react";
import {
  Users,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../styles/channelList.css";
import Sidebar from "./Sidebar";
import PostCards from "./PostCards";
import { AuthContext } from "../context/AuthContext";

const CHANNELS_PER_PAGE = 12;
const CHANNEL_MODAL_POST_LIMIT = 5;

const ChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedChannelPosts, setSelectedChannelPosts] = useState([]);
  const [selectedChannelPostsLoading, setSelectedChannelPostsLoading] = useState(false);
  const [selectedChannelPostsLoadingMore, setSelectedChannelPostsLoadingMore] =
    useState(false);
  const [selectedChannelPostsPagination, setSelectedChannelPostsPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0,
  });
  const [postActionLoadingId, setPostActionLoadingId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchChannels = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(CHANNELS_PER_PAGE),
      });
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (filterCategory && filterCategory !== "all") {
        params.set("category", filterCategory);
      }

      const res = await fetch(
        `http://localhost:8080/channel/list?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setChannels(data.allchannels || []);
        setPagination(data.pagination || { page: targetPage, totalPages: 1, total: 0 });
      } else {
        alert("Error fetching channels");
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels(page);
  }, [page, searchQuery, filterCategory]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterCategory]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const date = dateObj.$date ? new Date(dateObj.$date) : new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleManage = (channel, action) => {
    setShowMenu(null);
    console.log(`${action} channel:`, channel.channelName);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuControl =
        event.target.closest(".menu-button") || event.target.closest(".dropdown-menu");
      if (!isMenuControl && showMenu !== null) {
        setShowMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showMenu !== null) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

  const getCategoryColor = (category) => {
    const colors = {
      education: "#dbeafe",
      technology: "#e0e7ff",
      entertainment: "#fce7f3",
      news: "#fef3c7",
      sports: "#d1fae5",
      business: "#f3e8ff",
      lifestyle: "#fee2e2",
      gaming: "#ddd6fe",
    };
    return colors[category?.toLowerCase()] || "#f3f4f6";
  };

  const uniqueCategories = [...new Set(channels.flatMap((ch) => ch.channelCategory || []))].sort();

  const categoryCounts = {
    all: pagination.total || 0,
    ...Object.fromEntries(
      uniqueCategories.map((cat) => [
        cat.toLowerCase(),
        channels.filter((ch) => ch.channelCategory?.includes(cat)).length,
      ])
    ),
  };

  const filteredChannels = useMemo(() => channels || [], [channels]);

  const fetchSelectedChannelPosts = async (targetPage = 1, append = false) => {
    if (!selectedChannel?.channelName) {
      setSelectedChannelPosts([]);
      return;
    }

    if (append) {
      setSelectedChannelPostsLoadingMore(true);
    } else {
      setSelectedChannelPostsLoading(true);
    }

    try {
      const res = await fetch(
        `http://localhost:8080/post/channel/${encodeURIComponent(
          selectedChannel.channelName
        )}?page=${targetPage}&limit=${CHANNEL_MODAL_POST_LIMIT}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setSelectedChannelPosts((current) =>
          append ? [...current, ...(data.posts || [])] : data.posts || []
        );
        setSelectedChannelPostsPagination(
          data.pagination || { page: targetPage, hasMore: false, total: 0 }
        );
      } else {
        setSelectedChannelPosts([]);
      }
    } catch (error) {
      console.error("Error fetching selected channel posts:", error);
      setSelectedChannelPosts([]);
    } finally {
      setSelectedChannelPostsLoading(false);
      setSelectedChannelPostsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!selectedChannel?.channelName) {
      setSelectedChannelPosts([]);
      setSelectedChannelPostsPagination({ page: 1, hasMore: false, total: 0 });
      return;
    }

    fetchSelectedChannelPosts(1, false);
  }, [selectedChannel]);

  const handleToggleChannelPostArchive = async (post) => {
    const postKey = post._id || post.id;
    setPostActionLoadingId(postKey);

    try {
      const endpoint = post.isArchived
        ? `http://localhost:8080/post/channel-post/${post._id}/restore`
        : `http://localhost:8080/post/channel-post/${post._id}/archive`;

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

      setSelectedChannelPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          (currentPost._id || currentPost.id) === postKey
            ? { ...currentPost, isArchived: !currentPost.isArchived }
            : currentPost
        )
      );
    } catch (error) {
      console.error("Error updating channel post:", error);
      alert("Could not update post status");
    } finally {
      setPostActionLoadingId(null);
    }
  };

  const handleDeleteChannelPost = async (post) => {
    const postKey = post._id || post.id;
    setPostActionLoadingId(postKey);

    try {
      const res = await fetch(`http://localhost:8080/post/channel-post/${post._id}`, {
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

      setSelectedChannelPosts((currentPosts) =>
        currentPosts.filter((currentPost) => (currentPost._id || currentPost.id) !== postKey)
      );
      setSelectedChannelPostsPagination((current) => ({
        ...current,
        total: Math.max(0, (current.total || 0) - 1),
      }));
    } catch (error) {
      console.error("Error deleting channel post:", error);
      alert("Could not delete post");
    } finally {
      setPostActionLoadingId(null);
    }
  };

  const fetchComments = async (post, commentsPage = 1) => {
    const res = await fetch(
      `http://localhost:8080/post/channel-post/${post._id}/comments?page=${commentsPage}&limit=5`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || data.msg || "Unable to fetch comments");
    }
    return data;
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
          <div className="channels-header">
            <h2 className="channels-title">All Channels</h2>

            <div className="toolbar-wrap">
              <input
                type="search"
                placeholder="Search channels, descriptions or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="responsive-search-input"
                aria-label="Search channels"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="clear-inline-button"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="category-filter-row">
            <button
              onClick={() => setFilterCategory("all")}
              className={`category-filter-button ${filterCategory === "all" ? "active" : ""}`}
            >
              All ({categoryCounts.all})
            </button>
            {uniqueCategories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category.toLowerCase())}
                className={`category-filter-button ${
                  filterCategory === category.toLowerCase() ? "active" : ""
                }`}
                style={{
                  backgroundColor:
                    filterCategory === category.toLowerCase()
                      ? getCategoryColor(category)
                      : "#ffffff",
                }}
              >
                {category} ({categoryCounts[category.toLowerCase()] || 0})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading channels...</p>
            </div>
          ) : channels?.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#9ca3af" />
              <p className="empty-text">No channels found</p>
            </div>
          ) : filteredChannels?.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#9ca3af" />
              <p className="empty-text">No channels match your search</p>
            </div>
          ) : (
            <div className="channels-grid">
              {filteredChannels?.map((channel) => (
                <div key={channel._id} className="channel-card">
                  <div className="card-header">
                    <img
                      src={channel.channelLogo || "https://via.placeholder.com/80"}
                      alt={channel.channelName}
                      className="channel-logo"
                    />
                    <button
                      className="menu-button"
                      onClick={() =>
                        setShowMenu(showMenu === channel._id ? null : channel._id)
                      }
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showMenu === channel._id && (
                      <div className="dropdown-menu">
                        <button
                          className="menu-item"
                          onClick={() => handleManage(channel, "edit")}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="menu-item"
                          onClick={() => handleManage(channel, "archive")}
                        >
                          <Archive size={16} />
                          Archive
                        </button>
                        <button
                          className="menu-item danger"
                          onClick={() => handleManage(channel, "delete")}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="channel-name">{channel.channelName}</h3>

                  <p className="channel-description">
                    {channel.channelDescription?.length > 100
                      ? `${channel.channelDescription.substring(0, 100)}...`
                      : channel.channelDescription}
                  </p>

                  <div className="categories-container">
                    {channel.channelCategory?.map((category, index) => (
                      <span
                        key={index}
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="channel-stats">
                    <div className="stat-item">
                      <Users size={16} />
                      <span>{channel.channelMembers?.length || 0} Members</span>
                    </div>
                    <div className="stat-item">
                      <FileText size={16} />
                      <span>{channel.postIds?.length || 0} Posts</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>{formatDate(channel.createdAt)}</span>
                    </div>
                    <button className="manage-button" onClick={() => setSelectedChannel(channel)}>
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </div>

        {selectedChannel && (
          <div className="modal-overlay" onClick={() => setSelectedChannel(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Channel Details</h3>
                <button className="close-button" onClick={() => setSelectedChannel(null)}>
                  x
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-logo-section">
                  <img
                    src={selectedChannel.channelLogo}
                    alt={selectedChannel.channelName}
                    className="modal-logo"
                  />
                </div>

                <div className="modal-row">
                  <span className="modal-label">Channel Name:</span>
                  <span className="modal-value">{selectedChannel.channelName}</span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Description:</span>
                  <p className="modal-description">{selectedChannel.channelDescription}</p>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Categories:</span>
                  <div className="modal-categories">
                    {selectedChannel.channelCategory?.map((category, index) => (
                      <span
                        key={index}
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Members:</span>
                  <span className="modal-value">
                    {selectedChannel.channelMembers?.length || 0}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Total Posts:</span>
                  <span className="modal-value">{selectedChannel.postIds?.length || 0}</span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Archived Posts:</span>
                  <span className="modal-value">
                    {selectedChannel.archivedPostsIds?.length || 0}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Created:</span>
                  <span className="modal-value">{formatDate(selectedChannel.createdAt)}</span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Last Updated:</span>
                  <span className="modal-value">{formatDate(selectedChannel.updatedAt)}</span>
                </div>

                <div className="modal-section post-section">
                  <div className="post-section-header">
                    <div>
                      <h4 className="post-section-title">Channel Posts</h4>
                      <p className="post-section-subtitle">
                        Showing 5 at a time with comments, archive, restore, and delete controls.
                      </p>
                    </div>
                    <span className="post-count-chip">
                      {selectedChannelPostsPagination.total || 0} posts
                    </span>
                  </div>
                  <PostCards
                    posts={selectedChannelPosts}
                    loading={selectedChannelPostsLoading}
                    emptyMessage="This channel does not have any posts yet."
                    onToggleArchive={handleToggleChannelPostArchive}
                    onDeletePost={handleDeleteChannelPost}
                    actionLoadingId={postActionLoadingId}
                    fetchComments={fetchComments}
                    hasMore={selectedChannelPostsPagination.hasMore}
                    onLoadMore={() =>
                      fetchSelectedChannelPosts(
                        (selectedChannelPostsPagination.page || 1) + 1,
                        true
                      )
                    }
                    loadingMore={selectedChannelPostsLoadingMore}
                  />
                </div>

                <div className="modal-actions">
                  <button className="action-button edit">
                    <Edit size={16} />
                    Edit Channel
                  </button>
                  <button className="action-button archive">
                    <Archive size={16} />
                    Archive
                  </button>
                  <button className="action-button delete">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsPage;
