import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAdminSession } from "../../utils/adminHelper";
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
    { path: "/admin", label: "📊 Dashboard", icon: "📊" },
    { path: "/admin/users", label: "👥 Users", icon: "👥" },
    { path: "/admin/posts", label: "📝 Posts", icon: "📝" },
    { path: "/admin/events", label: "📅 Events", icon: "📅" },
    { path: "/admin/jobs", label: "💼 Jobs", icon: "💼" },
    { path: "/admin/resources", label: "📚 Resources", icon: "📚" },
    { path: "/admin/notifications", label: "📢 Notifications", icon: "📢" },
  ];

  return (
    <div className="admin-sidebar">
      <h2>🎓 EduConnect Admin</h2>
      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={isActive(item.path) ? "active" : ""}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <button
        onClick={handleLogout}
        className="btn admin-sidebar-logout"
        style={{ width: "100%" }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default Sidebar;