import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "../styles/dashboard.css";
import "../styles/userlist.css";
import Sidebar from "./Sidebar";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const { setIsAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/user/list", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          alert("Error fetching users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    const date = dateObj.$date ? new Date(dateObj.$date) : new Date(dateObj);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = dob.$date ? new Date(dob.$date) : new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleManage = (user, action) => {
    setShowMenu(null);
    console.log(`${action} user:`, user.username);
    // Implement your action logic here
  };

  const getTypeColor = (type) => {
    const colors = {
      'normal': '#dbeafe',
      'kids': '#fce7f3',
    };
    return colors[type?.toLowerCase()] || '#f3f4f6';
  };

  const [searchQuery, setSearchQuery] = useState("");

  const searchStyles = {
    container: { display: 'flex', alignItems: 'center', gap: '8px' },
    input: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      width: '320px',
      outline: 'none',
      fontSize: '14px',
    },
    clearBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px' },
  };

  const handleClearSearch = () => setSearchQuery("");

  const filteredUsers = filterType === 'all' 
    ? users 
    : filterType === 'premium'
    ? users.filter(user => user.isPremium)
    : filterType === 'kids'
    ? users.filter(user => user.type?.toLowerCase() === 'kids')
    : users.filter(user => !user.isPremium);

  const userStats = {
    all: users.length,
    premium: users.filter(u => u.isPremium).length,
    nonPremium: users.filter(u => !u.isPremium).length,
    kids: users.filter(u => u.type?.toLowerCase() === 'kids').length,
  };

  const searchedUsers = (filteredUsers || []).filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.username || '').toString().toLowerCase().includes(q) ||
      (u.fullName || '').toString().toLowerCase().includes(q) ||
      (u.email || '').toString().toLowerCase().includes(q) ||
      (u.bio || '').toString().toLowerCase().includes(q)
    );
  });

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="search"
                placeholder="Search username, name, email or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchStyles.input}
                aria-label="Search users"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} style={searchStyles.clearBtn} aria-label="Clear search">Clear</button>
              )}
              <div className="users-stats" style={{ marginLeft: '8px' }}>
                <span className="stat-badge">Total: {searchedUsers.length}</span>
                <span className="stat-badge premium">Premium: {userStats.premium}</span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
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
                <div className="summary-label">Premium</div>
                <div className="summary-value">{userStats.premium}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon normal-icon">
                <User size={24} color="#10b981" />
              </div>
              <div>
                <div className="summary-label">Non-Premium</div>
                <div className="summary-value">{userStats.nonPremium}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon kids-icon">
                <Shield size={24} color="#ec4899" />
              </div>
              <div>
                <div className="summary-label">Kids</div>
                <div className="summary-value">{userStats.kids}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <button 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({userStats.all})
            </button>
            <button 
              className={`filter-btn ${filterType === 'premium' ? 'active' : ''}`}
              onClick={() => setFilterType('premium')}
            >
              Premium ({userStats.premium})
            </button>
            <button 
              className={`filter-btn ${filterType === 'non-premium' ? 'active' : ''}`}
              onClick={() => setFilterType('non-premium')}
            >
              Non-Premium ({userStats.nonPremium})
            </button>
            <button 
              className={`filter-btn ${filterType === 'kids' ? 'active' : ''}`}
              onClick={() => setFilterType('kids')}
            >
              Kids ({userStats.kids})
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading users...</p>
            </div>
          ) : searchedUsers.length === 0 ? (
            <div className="empty-state">
              <User size={48} color="#9ca3af" />
              <p className="empty-text">No users match your search</p>
            </div>
          ) : (
            <div className="users-grid">
              {searchedUsers.map((user) => (
                <div 
                  key={user._id || user.id} 
                  className="user-card"
                  style={{
                    borderLeft: `4px solid ${user.isPremium ? '#f59e0b' : '#6366f1'}`,
                  }}
                >
                  <div className="card-header">
                    <div className="user-avatar-section">
                      <img
                        src={
                          user.profilePicture ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        className="user-avatar-large"
                      />
                      {user.isPremium && (
                        <div className="premium-badge">
                          <Crown size={14} />
                        </div>
                      )}
                    </div>
                    <button 
                      className="menu-button"
                      onClick={() => setShowMenu(showMenu === user._id ? null : user._id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {showMenu === user._id && (
                      <div className="dropdown-menu">
                        <button 
                          className="menu-item"
                          onClick={() => handleManage(user, 'edit')}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button 
                          className="menu-item"
                          onClick={() => handleManage(user, 'ban')}
                        >
                          <Ban size={16} />
                          Ban User
                        </button>
                        <button 
                          className="menu-item danger"
                          onClick={() => handleManage(user, 'delete')}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="user-main-info">
                    <h3 className="user-name">{user.fullName || user.username}</h3>
                    <p className="user-username">@{user.username}</p>
                    {user.bio && (
                      <p className="user-bio">
                        {user.bio.length > 80 ? `${user.bio.substring(0, 80)}...` : user.bio}
                      </p>
                    )}
                  </div>

                  <div className="user-details-grid">
                    <div className="detail-item">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="user-badges">
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(user.type) }}
                    >
                      {user.type || 'Normal'}
                    </span>
                    <span className="status-badge">
                      {user.isPremium ? 'Premium' : 'Free'}
                    </span>
                    {user.gender && (
                      <span className="gender-badge">{user.gender}</span>
                    )}
                  </div>

                  <div className="user-stats-grid">
                    <div className="stat-box">
                      <UsersIcon size={16} />
                      <div>
                        <div className="stat-label">Followers</div>
                        <div className="stat-count">{user.followers?.length || 0}</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <FileText size={16} />
                      <div>
                        <div className="stat-label">Posts</div>
                        <div className="stat-count">{user.postIds?.length || 0}</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <Heart size={16} />
                      <div>
                        <div className="stat-label">Likes</div>
                        <div className="stat-count">{user.likedPostsIds?.length || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    <button 
                      className="manage-button"
                      onClick={() => setSelectedUser(user)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">User Details</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedUser(null)}
              >
                ✕
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
                  <span className="modal-value">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Gender:</span>
                  <span className="modal-value">{selectedUser.gender || 'N/A'}</span>
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
                  <span className="modal-value">{selectedUser.type || 'Normal'}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Subscription:</span>
                  <span className="modal-value">{selectedUser.isPremium ? 'Premium' : 'Free'}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Visibility:</span>
                  <span className="modal-value">{selectedUser.visibility || 'Public'}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Coins:</span>
                  <span className="modal-value">{selectedUser.coins || 0}</span>
                </div>
                {selectedUser.type?.toLowerCase() === 'kids' && selectedUser.timeLimit && (
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
                      <div className="modal-stat-value">{selectedUser.followers?.length || 0}</div>
                    </div>
                  </div>
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Following</div>
                      <div className="modal-stat-value">{selectedUser.followings?.length || 0}</div>
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
                      <div className="modal-stat-value">{selectedUser.likedPostsIds?.length || 0}</div>
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
                      <div className="modal-stat-value">{selectedUser.savedPostsIds?.length || 0}</div>
                    </div>
                  </div>
                  <div className="modal-stat-card">
                    <div className="modal-stat-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <div className="modal-stat-label">Channels</div>
                      <div className="modal-stat-value">{selectedUser.channelFollowings?.length || 0}</div>
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