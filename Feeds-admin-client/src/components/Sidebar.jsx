import {
  Book,
  BarChart3,
  ShoppingCart,
  Monitor,
  LogOut,
  Users,
  Antenna,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 900) {
      document.body.style.overflow = isMobileOpen ? "hidden" : "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

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

  const closeMobileNav = () => setIsMobileOpen(false);

  return (
    <>
      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileNav}
          aria-label="Close navigation"
        />
      )}

      <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">F</div>
            <span className="sidebar-title">Feeds</span>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeMobileNav}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/userList"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <Users size={18} />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/channelList"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <Antenna size={18} />
            <span>Channels</span>
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <FileText size={18} />
            <span>Posts</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <Book size={18} />
            <span>Tickets</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <ShoppingCart size={18} />
            <span>Transactions</span>
          </NavLink>

          <NavLink
            to="/feedbacks"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <Book size={18} />
            <span>Feedbacks</span>
          </NavLink>

          <NavLink
            to="/managers"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
          >
            <Book size={18} />
            <span>Managers</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            onClick={closeMobileNav}
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
    </>
  );
}
