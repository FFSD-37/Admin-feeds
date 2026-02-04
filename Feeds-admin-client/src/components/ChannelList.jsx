import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
} from "lucide-react";
import "../styles/channelList.css";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const ChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("http://localhost:8080/channel/list", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success) {
          setChannels(data.allchannels);
        } else {
          alert("Error fetching channels");
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

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
    // Implement your action logic here
  };

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
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

        {/* Channels Content */}
        <div className="content-area">
          <div className="channels-header">
            <h2 className="channels-title">All Channels</h2>
            <div className="channels-stats">
              <span className="stat-badge">Total: {channels?.length}</span>
            </div>
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
          ) : (
            <div className="channels-grid">
              {channels?.map((channel) => (
                <div key={channel._id} className="channel-card">
                  {/* Card Header with Logo */}
                  <div className="card-header">
                    <img
                      src={
                        channel.channelLogo || "https://via.placeholder.com/80"
                      }
                      alt={channel.channelName}
                      className="channel-logo"
                    />
                    <button
                      className="menu-button"
                      onClick={() =>
                        setShowMenu(
                          showMenu === channel._id ? null : channel._id,
                        )
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

                  {/* Channel Name */}
                  <h3 className="channel-name">{channel.channelName}</h3>

                  {/* Channel Description */}
                  <p className="channel-description">
                    {channel.channelDescription?.length > 100
                      ? `${channel.channelDescription.substring(0, 100)}...`
                      : channel.channelDescription}
                  </p>

                  {/* Categories */}
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

                  {/* Stats */}
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

                  {/* Footer */}
                  <div className="card-footer">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>{formatDate(channel.createdAt)}</span>
                    </div>
                    <button
                      className="manage-button"
                      onClick={() => setSelectedChannel(channel)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for detailed view */}
        {selectedChannel && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedChannel(null)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Channel Details</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedChannel(null)}
                >
                  ✕
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
                  <span className="modal-value">
                    {selectedChannel.channelName}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Description:</span>
                  <p className="modal-description">
                    {selectedChannel.channelDescription}
                  </p>
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
                  <span className="modal-value">
                    {selectedChannel.postIds?.length || 0}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Archived Posts:</span>
                  <span className="modal-value">
                    {selectedChannel.archivedPostsIds?.length || 0}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Created:</span>
                  <span className="modal-value">
                    {formatDate(selectedChannel.createdAt)}
                  </span>
                </div>

                <div className="modal-row">
                  <span className="modal-label">Last Updated:</span>
                  <span className="modal-value">
                    {formatDate(selectedChannel.updatedAt)}
                  </span>
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
