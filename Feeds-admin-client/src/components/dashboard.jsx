import React, { useEffect, useState } from "react";
import {
  Map,
  Book,
  BarChart3,
  ShoppingCart,
  Monitor,
  LogOut,
  Settings,
} from "lucide-react";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const ordersData = [
    { day: "Mon", value: 60 },
    { day: "Tue", value: 75 },
    { day: "Wed", value: 70 },
    { day: "Thu", value: 85 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 65 },
    { day: "Sun", value: 70 },
  ];

  const [users, setUsers] = useState([]);
  const [channels, setChannel] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8080/home/getUsers", {
      method: "GET",
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
  };

  const fetchChannels = async () => {
    const res = await fetch("http://localhost:8080/home/getChannels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      setChannel(data.data);
    } else {
      alert("Error fetching users");
    }
  };

  const logout = async () => {
    const res = await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const data = await res.json();
    if (data.success){
      navigate("/login")
    }
  }

  useEffect(() => {
    Promise.all([fetchUsers(), fetchChannels()]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">Feeds</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <BarChart3 size={18} />
            <span>Overview</span>
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
        {loading && (
          <div className="loader-overlay" role="status" aria-live="polite">
            <div className="loader-panel">
              <div className="spinner" aria-hidden="true" />
              <div className="loader-text">Loading dashboard…</div>

              <div className="skeleton-grid" aria-hidden="true">
                <div className="skeleton-card skeleton-anim" />
                <div className="skeleton-card skeleton-anim" />
                <div className="skeleton-card skeleton-anim" />
              </div>

              <div className="skeleton-list" aria-hidden="true">
                <div className="skeleton-list-item skeleton-anim" />
                <div className="skeleton-list-item skeleton-anim" />
                <div className="skeleton-list-item skeleton-anim" />
              </div>
            </div>
          </div>
        )}
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

        {/* Dashboard Content */}
        <div className="content-area">
          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="button-group-right">
              <button className="button-secondary">Share insights</button>
              <button
                className="button-secondary"
                style={{ marginLeft: "0.75rem" }}
              >
                Export Data
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="stats-grid">
            {/* Customers */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3 className="stat-title">Users</h3>
                  <div className="stat-value">345k</div>
                </div>
                <div className="stat-icon">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3 className="stat-title">Revenue</h3>
                  <div className="stat-value">$43,594</div>
                </div>
                <div className="stat-icon">
                  <ShoppingCart size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-grid">
            {/* Page Visits */}
            <div className="page-visits-card">
              {/* <div className="card-header">
                <h3 className="card-title">Page visits</h3>
                <button className="see-all-button">See all</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead className="table-header">
                    <tr>
                      <th>Page Name</th>
                      <th>Page Views</th>
                      <th>Page Value</th>
                      <th>Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {pageVisits.map((page, index) => (
                      <tr key={index}>
                        <td>{page.name}</td>
                        <td>{page.views.toLocaleString()}</td>
                        <td>{page.value}</td>
                        <td>
                          <span
                            className={
                              page.trend === "up"
                                ? "bounce-rate-up"
                                : "bounce-rate-down"
                            }
                          >
                            {page.trend === "up" ? "▲" : "▼"} {page.bounce}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}

              {/* Team Members Section */}
              <div className="team-section">
                <div className="section-header">
                  <h3 className="section-title">Team members</h3>
                  <button className="button-cyan">See all</button>
                </div>
                <div className="team-list">
                  {users.map((member, index) => (
                    <div
                      key={index}
                      className="team-member"
                      style={{
                        backgroundColor:
                          member.type === "Kids" ? "lightpink" : "lightblue",
                      }}
                    >
                      <div className="member-info">
                        <img
                          src={member.profilePicture}
                          alt={member.username}
                          className="member-avatar"
                        />
                        <div>
                          <div className="member-name">{member.username}</div>
                          <div className="member-status">
                            {member.isPremium ? "Premium" : "Non-premium"}
                          </div>
                        </div>
                      </div>
                      <button className="member-action">Manage</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Track */}
              {/* <div className="progress-section">
                <h3 className="section-title">Progress track</h3>
                <div className="progress-list">
                  {progressItems.map((item, index) => (
                    <div key={index} className="progress-item">
                      <div className={`progress-icon ${item.colorClass}`}>
                        {item.icon}
                      </div>
                      <div className="progress-content">
                        <div className="progress-header">
                          <span className="progress-name">{item.name}</span>
                          <span className="progress-percentage">
                            {item.progress}%
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
              <div className="team-section">
                <div className="section-header">
                  <h3 className="section-title">Channels</h3>
                  <button className="button-cyan">See all</button>
                </div>
                <div className="team-list">
                  {users.map((member, index) => (
                    <div
                      key={index}
                      className="team-member"
                      style={{
                        backgroundColor:
                          member.type === "Kids" ? "lightpink" : "lightblue",
                      }}
                    >
                      <div className="member-info">
                        <img
                          src={member.profilePicture}
                          alt={member.username}
                          className="member-avatar"
                        />
                        <div>
                          <div className="member-name">{member.username}</div>
                          <div className="member-status">
                            {member.isPremium ? "Premium" : "Non-premium"}
                          </div>
                        </div>
                      </div>
                      <button className="member-action">Manage</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Total Orders */}
              <div className="orders-card">
                <h3 className="stat-title">Total orders</h3>
                <div className="stat-value">452</div>
                <div className="stat-change" style={{ marginBottom: "1rem" }}>
                  ▲ 18.2%
                </div>

                <div className="orders-legend">
                  <span className="legend-dot legend-dot-dark"></span>
                  <span className="legend-label">July</span>
                  <span
                    className="legend-dot legend-dot-cyan"
                    style={{ marginLeft: "1rem" }}
                  ></span>
                  <span className="legend-label">August</span>
                </div>

                {/* Bar Chart */}
                <div className="bar-chart">
                  {ordersData.map((item, index) => (
                    <div key={index} className="bar-column">
                      <div className="bar-stack">
                        <div
                          className="bar-dark"
                          style={{ height: `${item.value * 0.6}px` }}
                        ></div>
                        <div
                          className="bar-cyan"
                          style={{ height: `${item.value * 0.8}px` }}
                        ></div>
                      </div>
                      <span className="bar-label">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rankings */}
              <div className="rankings-card">
                <div className="rank-item">
                  <div className="rank-info-container">
                    <div className="rank-icon-container">
                      <BarChart3 size={16} />
                    </div>
                    <div>
                      <div className="rank-title">Global Rank</div>
                    </div>
                  </div>
                  <div className="rank-value-container">
                    <span className="rank-value">#755</span>
                    <span className="rank-arrow">↗</span>
                  </div>
                </div>

                <div className="rank-item">
                  <div className="rank-info-container">
                    <div className="rank-icon-container">
                      <Map size={16} />
                    </div>
                    <div>
                      <div className="rank-title">Country Rank</div>
                      <div className="rank-subtitle">United States ▲</div>
                    </div>
                  </div>
                  <div className="rank-value-container">
                    <span className="rank-value">#32</span>
                    <span className="rank-arrow">↗</span>
                  </div>
                </div>

                <div className="rank-item">
                  <div className="rank-info-container">
                    <div className="rank-icon-container">
                      <Book size={16} />
                    </div>
                    <div>
                      <div className="rank-title">Category Rank</div>
                      <div className="rank-subtitle">Travel Accomodation</div>
                    </div>
                  </div>
                  <div className="rank-value-container">
                    <span className="rank-value">#16</span>
                    <span className="rank-arrow">↗</span>
                  </div>
                </div>
              </div>

              {/* Acquisition */}
              <div className="acquisition-card">
                <h3 className="section-title">Acquisition</h3>
                <p className="acquisition-description">
                  Tells you where your visitors originated from, such as search
                  engines, social networks or website referrals.
                </p>

                <div className="acquisition-stats">
                  <div>
                    <div className="acquisition-stat">
                      <BarChart3 size={16} />
                      <span className="acquisition-stat-label">
                        Bounce Rate
                      </span>
                    </div>
                    <div className="acquisition-stat-value">33.50%</div>
                  </div>

                  <div>
                    <div className="acquisition-stat">
                      <BarChart3 size={16} />
                      <span className="acquisition-stat-label">Sessions</span>
                    </div>
                    <div className="acquisition-stat-value">9,567</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
