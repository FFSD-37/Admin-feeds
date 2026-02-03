import {
  Book,
  BarChart3,
  ShoppingCart,
  Monitor,
  LogOut,
  Users,
  Antenna
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">⚡</div>
        <span className="sidebar-title">Feeds</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <BarChart3 size={18} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/userList"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Users size={18} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/channelList"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Antenna size={18} />
          <span>Channels</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Book size={18} />
          <span>Tickets</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ShoppingCart size={18} />
          <span>Transactions</span>
        </NavLink>

        <NavLink
          to="/feedbacks"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Book size={18} />
          <span>Feedbacks</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Monitor size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="upgrade-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}