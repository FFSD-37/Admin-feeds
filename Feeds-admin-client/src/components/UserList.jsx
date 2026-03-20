import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Ban,
  Shield,
  MoreVertical,
  Crown,
  Users as UsersIcon,
  Heart,
  Bookmark,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../styles/dashboard.css";
import "../styles/userlist.css";
import Sidebar from "./Sidebar";
import PostCards from "./PostCards";

const USERS_PER_PAGE = 12;
const USER_MODAL_POST_LIMIT = 5;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [selectedUserPostsLoading, setSelectedUserPostsLoading] = useState(false);
  const [selectedUserPostsLoadingMore, setSelectedUserPostsLoadingMore] = useState(false);
  const [selectedUserPostsPagination, setSelectedUserPostsPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0,
  });
  const [postActionLoadingId, setPostActionLoadingId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const { user } = useContext(AuthContext);

  const fetchUsers = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(USERS_PER_PAGE),
      });
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(
        `http://localhost:8080/user/list?${params.toString()}`,
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
        setUsers(data.data || []);
        setPagination(data.pagination || { page: targetPage, totalPages: 1, total: 0 });
      } else {
        alert("Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const date = dateObj.$date ? new Date(dateObj.$date) : new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = dob.$date ? new Date(dob.$date) : new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleManage = (targetUser, action) => {
    setShowMenu(null);
    console.log(`${action} user:`, targetUser.username);
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

  const getTypeColor = (type) => {
    const colors = {
      normal: "#dbeafe",
      kids: "#fce7f3",
    };
    return colors[type?.toLowerCase()] || "#f3f4f6";
  };

  const fetchSelectedUserPosts = async (targetPage = 1, append = false) => {
    if (!selectedUser?.username) {
      setSelectedUserPosts([]);
      return;
    }

    if (append) {
      setSelectedUserPostsLoadingMore(true);
    } else {
      setSelectedUserPostsLoading(true);
    }

    try {
      const res = await fetch(
        `http://localhost:8080/post/user/${selectedUser.username}?page=${targetPage}&limit=${USER_MODAL_POST_LIMIT}`,
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
        setSelectedUserPosts((current) =>
          append ? [...current, ...(data.posts || [])] : data.posts || []
        );
        setSelectedUserPostsPagination(
          data.pagination || { page: targetPage, hasMore: false, total: 0 }
        );
      } else {
        setSelectedUserPosts([]);
      }
    } catch (error) {
      console.error("Error fetching selected user posts:", error);
      setSelectedUserPosts([]);
    } finally {
      setSelectedUserPostsLoading(false);
      setSelectedUserPostsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!selectedUser?.username) {
      setSelectedUserPosts([]);
      setSelectedUserPostsPagination({ page: 1, hasMore: false, total: 0 });
      return;
    }

    fetchSelectedUserPosts(1, false);
  }, [selectedUser]);

  const handleToggleUserPostArchive = async (post) => {
    const postKey = post._id || post.id;
    setPostActionLoadingId(postKey);

    try {
      const endpoint = post.isArchived
        ? `http://localhost:8080/post/${post._id}/restore`
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

      setSelectedUserPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          (currentPost._id || currentPost.id) === postKey
            ? { ...currentPost, isArchived: !currentPost.isArchived }
            : currentPost
        )
      );
    } catch (error) {
      console.error("Error updating user post:", error);
      alert("Could not update post status");
    } finally {
      setPostActionLoadingId(null);
    }
  };

  const handleDeleteUserPost = async (post) => {
    const postKey = post._id || post.id;
    setPostActionLoadingId(postKey);

    try {
      const res = await fetch(`http://localhost:8080/post/${post._id}`, {
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

      setSelectedUserPosts((currentPosts) =>
        currentPosts.filter((currentPost) => (currentPost._id || currentPost.id) !== postKey)
      );
      setSelectedUserPostsPagination((current) => ({
        ...current,
        total: Math.max(0, (current.total || 0) - 1),
      }));
    } catch (error) {
      console.error("Error deleting user post:", error);
      alert("Could not delete post");
    } finally {
      setPostActionLoadingId(null);
    }
  };

  const fetchComments = async (post, commentsPage = 1) => {
    const res = await fetch(
      `http://localhost:8080/post/${post._id}/comments?page=${commentsPage}&limit=5`,
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

  const filteredUsers = useMemo(() => {
    const baseUsers =
      filterType === "all"
        ? users
        : filterType === "premium"
          ? users.filter((item) => item.isPremium)
          : filterType === "kids"
            ? users.filter((item) => item.type?.toLowerCase() === "kids")
            : users.filter((item) => !item.isPremium);

    return baseUsers || [];
  }, [filterType, users]);

  const userStats = {
    all: pagination.total || 0,
    premium: users.filter((item) => item.isPremium).length,
    nonPremium: users.filter((item) => !item.isPremium).length,
    kids: users.filter((item) => item.type?.toLowerCase() === "kids").length,
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
          <div className="users-header">
            <h2 className="users-title">All Users</h2>
            <div className="toolbar-wrap">
              <input
                type="search"
                placeholder="Search username, name, email or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="responsive-search-input"
                aria-label="Search users"
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
              <div className="users-stats">
                <span className="stat-badge">Visible: {filteredUsers.length}</span>
                <span className="stat-badge premium">Premium on page: {userStats.premium}</span>
              </div>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">
                <UsersIcon size={24} color="#6366f1" />
              </div>
              <div>
                <div className="summary-label">Total Users</div>
                <div className="summary-value">{userStats.all}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon premium-icon">
                <Crown size={24} color="#f59e0b" />
              </div>
              <div>
                <div className="summary-label">Premium On Page</div>
                <div className="summary-value">{userStats.premium}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon normal-icon">
                <User size={24} color="#10b981" />
              </div>
              <div>
                <div className="summary-label">Non-Premium On Page</div>
                <div className="summary-value">{userStats.nonPremium}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon kids-icon">
                <Shield size={24} color="#ec4899" />
              </div>
              <div>
                <div className="summary-label">Kids On Page</div>
                <div className="summary-value">{userStats.kids}</div>
              </div>
            </div>
          </div>

          <div className="filters-container">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === "premium" ? "active" : ""}`}
              onClick={() => setFilterType("premium")}
            >
              Premium
            </button>
            <button
              className={`filter-btn ${filterType === "non-premium" ? "active" : ""}`}
              onClick={() => setFilterType("non-premium")}
            >
              Non-Premium
            </button>
            <button
              className={`filter-btn ${filterType === "kids" ? "active" : ""}`}
              onClick={() => setFilterType("kids")}
            >
              Kids
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <User size={48} color="#9ca3af" />
              <p className="empty-text">No users match your search</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((listUser) => (
                <div
                  key={listUser._id || listUser.id}
                  className="user-card"
                  style={{
                    borderLeft: `4px solid ${listUser.isPremium ? "#f59e0b" : "#6366f1"}`,
                  }}
                >
                  <div className="card-header">
                    <div className="user-avatar-section">
                      <img
                        src={
                          listUser.profilePicture ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${listUser.username}`
                        }
                        alt={listUser.username}
                        className="user-avatar-large"
                      />
                      {listUser.isPremium && (
                        <div className="premium-badge">
                          <Crown size={14} />
                        </div>
                      )}
                    </div>
                    <button
                      className="menu-button"
                      onClick={() =>
                        setShowMenu(showMenu === listUser._id ? null : listUser._id)
                      }
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showMenu === listUser._id && (
                      <div className="dropdown-menu">
                        <button
                          className="menu-item"
                          onClick={() => handleManage(listUser, "edit")}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="menu-item"
                          onClick={() => handleManage(listUser, "ban")}
                        >
                          <Ban size={16} />
                          Ban User
                        </button>
                        <button
                          className="menu-item danger"
                          onClick={() => handleManage(listUser, "delete")}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="user-main-info">
                    <h3 className="user-name">{listUser.fullName || listUser.username}</h3>
                    <p className="user-username">@{listUser.username}</p>
                    {listUser.bio && (
                      <p className="user-bio">
                        {listUser.bio.length > 80
                          ? `${listUser.bio.substring(0, 80)}...`
                          : listUser.bio}
                      </p>
                    )}
                  </div>

                  <div className="user-details-grid">
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{listUser.email}</span>
                    </div>
                    {listUser.phone && (
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{listUser.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="user-badges">
                    <span
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(listUser.type) }}
                    >
                      {listUser.type || "Normal"}
                    </span>
                    <span className="status-badge">
                      {listUser.isPremium ? "Premium" : "Free"}
                    </span>
                    {listUser.gender && <span className="gender-badge">{listUser.gender}</span>}
                  </div>

                  <div className="user-stats-grid">
                    <div className="stat-box">
                      <UsersIcon size={16} />
                      <div>
                        <div className="stat-label">Followers</div>
                        <div className="stat-count">{listUser.followers?.length || 0}</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <FileText size={16} />
                      <div>
                        <div className="stat-label">Posts</div>
                        <div className="stat-count">{listUser.postIds?.length || 0}</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <Heart size={16} />
                      <div>
                        <div className="stat-label">Likes</div>
                        <div className="stat-count">{listUser.likedPostsIds?.length || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>Joined {formatDate(listUser.createdAt)}</span>
                    </div>
                    <button className="manage-button" onClick={() => setSelectedUser(listUser)}>
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
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">User Details</h3>
              <button className="close-button" onClick={() => setSelectedUser(null)}>
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-user-section">
                <img
                  src={
                    selectedUser.profilePicture ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`
                  }
                  alt={selectedUser.username}
                  className="modal-avatar"
                />
                <h3 className="modal-user-name">{selectedUser.fullName}</h3>
                <p className="modal-user-username">@{selectedUser.username}</p>
                {selectedUser.isPremium && (
                  <span className="premium-label">
                    <Crown size={16} /> Premium User
                  </span>
                )}
              </div>

              <div className="modal-section">
                <h4 className="section-title">Personal Information</h4>
                <div className="modal-row">
                  <span className="modal-label">Full Name:</span>
                  <span className="modal-value">{selectedUser.fullName}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Email:</span>
                  <span className="modal-value">{selectedUser.email}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Phone:</span>
                  <span className="modal-value">{selectedUser.phone || "N/A"}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Gender:</span>
                  <span className="modal-value">{selectedUser.gender || "N/A"}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Age:</span>
                  <span className="modal-value">{calculateAge(selectedUser.dob)} years</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Date of Birth:</span>
                  <span className="modal-value">{formatDate(selectedUser.dob)}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="section-title">Account Information</h4>
                <div className="modal-row">
                  <span className="modal-label">Account Type:</span>
                  <span className="modal-value">{selectedUser.type || "Normal"}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Subscription:</span>
                  <span className="modal-value">
                    {selectedUser.isPremium ? "Premium" : "Free"}
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Visibility:</span>
                  <span className="modal-value">{selectedUser.visibility || "Public"}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Coins:</span>
                  <span className="modal-value">{selectedUser.coins || 0}</span>
                </div>
                {selectedUser.type?.toLowerCase() === "kids" && selectedUser.timeLimit && (
                  <div className="modal-row">
                    <span className="modal-label">Time Limit:</span>
                    <span className="modal-value">{selectedUser.timeLimit} minutes</span>
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h4 className="section-title">Activity Statistics</h4>
                <div className="stats-row">
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Followers</div>
                      <div className="modal-stat-value">
                        {selectedUser.followers?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Following</div>
                      <div className="modal-stat-value">
                        {selectedUser.followings?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stats-row">
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Posts</div>
                      <div className="modal-stat-value">{selectedUser.postIds?.length || 0}</div>
                    </div>
                  </div>
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <Heart size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Liked Posts</div>
                      <div className="modal-stat-value">
                        {selectedUser.likedPostsIds?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stats-row">
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <Bookmark size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Saved Posts</div>
                      <div className="modal-stat-value">
                        {selectedUser.savedPostsIds?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Channels</div>
                      <div className="modal-stat-value">
                        {selectedUser.channelFollowings?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="modal-section">
                  <h4 className="section-title">Bio</h4>
                  <p className="modal-bio">{selectedUser.bio}</p>
                </div>
              )}

              <div className="modal-section">
                <h4 className="section-title">Dates</h4>
                <div className="modal-row">
                  <span className="modal-label">Joined:</span>
                  <span className="modal-value">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Last Updated:</span>
                  <span className="modal-value">{formatDate(selectedUser.updatedAt)}</span>
                </div>
              </div>

              <div className="modal-section post-section">
                <div className="post-section-header">
                  <div>
                    <h4 className="post-section-title">User Posts</h4>
                    <p className="post-section-subtitle">
                      Showing 5 at a time with comments, archive, restore, and delete controls.
                    </p>
                  </div>
                  <span className="post-count-chip">
                    {selectedUserPostsPagination.total || 0} posts
                  </span>
                </div>
                <PostCards
                  posts={selectedUserPosts}
                  loading={selectedUserPostsLoading}
                  emptyMessage="This user has not created any posts yet."
                  onToggleArchive={handleToggleUserPostArchive}
                  onDeletePost={handleDeleteUserPost}
                  actionLoadingId={postActionLoadingId}
                  fetchComments={fetchComments}
                  hasMore={selectedUserPostsPagination.hasMore}
                  onLoadMore={() =>
                    fetchSelectedUserPosts(
                      (selectedUserPostsPagination.page || 1) + 1,
                      true
                    )
                  }
                  loadingMore={selectedUserPostsLoadingMore}
                />
              </div>

              <div className="modal-actions">
                <button className="action-button edit">
                  <Edit size={16} />
                  Edit User
                </button>
                <button className="action-button ban">
                  <Ban size={16} />
                  Ban User
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
  );
};

export default UsersPage;
