import React, { useState, useEffect, useContext } from "react";
import { BarChart3, Book, ShoppingCart, Monitor, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/dashboard.css";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setIsAuthenticated } = useContext(AuthContext);

  const logout = async () => {
    const res = await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  };

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

  const handleManage = (userId) => {
    console.log("Managing user:", userId);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">Feeds</span>
        </div>

        <nav className="sidebar-nav">
          <a
            href="/dashboard"
            className="nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </a>
          <a href="/userList" className="nav-item">
            <BarChart3 size={18} />
            <span>All Users</span>
          </a>
          <a href="#" className="nav-item">
            <div className="nav-badge-relative">
              <Book size={18} />
            </div>
            <span>Tickets</span>
          </a>
          <a href="#" className="nav-item">
            <ShoppingCart size={18} />
            <span>Transactions</span>
          </a>
          <a href="#" className="nav-item">
            <Book size={18} />
            <span>Feedbacks</span>
          </a>
          <a href="#" className="nav-item">
            <Monitor size={18} />
            <span>Settings</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          <button className="upgrade-button" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
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
              <span className="user-name">Admin</span>
            </div>
          </div>
        </div>

        {/* Users Content */}
        <div className="content-area">
          <h2
            style={{
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            All Users
          </h2>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#555" }}
            >
              Loading users...
            </div>
          ) : (
            <div style={styles.userList}>
              {users.map((user) => (
                <div
                  key={user._id || user.id}
                  style={{
                    ...styles.userCard,
                    backgroundColor:
                      user.type === "Kids" ? "lightpink" : "lightblue",
                  }}
                >
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      <img
                        src={
                          user.profilePicture ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        style={styles.avatarImg}
                      />
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.username}>{user.username}</div>
                      <div style={styles.status}>
                        {user.isPremium ? "Premium" : "Non-premium"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleManage(user._id || user.id)}
                    style={styles.manageButton}
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  userList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: "100%",
  },
  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  username: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "#333",
  },
  status: {
    fontSize: "0.9rem",
    color: "#555",
  },
  manageButton: {
    padding: "0.5rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#6dbea3",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};

export default UsersPage;
