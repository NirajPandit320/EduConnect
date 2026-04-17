import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAdminSession } from "../../utils/adminHelper";
import {
  FiBell,
  FiBriefcase,
  FiClipboard,
  FiHome,
  FiLogOut,
  FiUsers,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";
import "../../styles/admin.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      clearAdminSession();
      navigate("/auth");
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: FiHome },
    { path: "/admin/users", label: "Users", icon: FiUsers },
    { path: "/admin/posts", label: "Posts", icon: FiClipboard },
    { path: "/admin/events", label: "Events", icon: FiCalendar },
    { path: "/admin/jobs", label: "Jobs", icon: FiBriefcase },
    { path: "/admin/resources", label: "Resources", icon: FiBookOpen },
    { path: "/admin/notifications", label: "Notifications", icon: FiBell },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand-mark">EC</div>
        <div>
          <h2>EduConnect</h2>
          <p>Admin Control Center</p>
        </div>
      </div>

      <div className="admin-sidebar-section-label">Navigation</div>

      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="admin-sidebar-icon">
                <item.icon />
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-footer-card">
          <span className="admin-sidebar-footer-title">Session</span>
          <span className="admin-sidebar-footer-text">Secure admin access</span>
        </div>

        <button onClick={handleLogout} className="btn admin-sidebar-logout" type="button">
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;