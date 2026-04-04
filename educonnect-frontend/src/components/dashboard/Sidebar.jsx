import {
  FaHome,
  FaFileAlt,
  FaCalendarAlt,
  FaQuestionCircle,
  FaComments,
  FaPhone,
  FaVideo,
  FaBell,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../store/userSlice";


const Sidebar = ({
  setActivePage,
  activePage,
  isCollapsed,
  setIsCollapsed,
}) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
  };

  const menuItems = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "posts", icon: <FaFileAlt />, label: "Posts" },
    { key: "events", icon: <FaCalendarAlt />, label: "Events" },
    { key: "quizzes", icon: <FaQuestionCircle />, label: "Quizzes" },
    { key: "chat", icon: <FaComments />, label: "Chat" },
    { key: "audio", icon: <FaPhone />, label: "Audio Call" },
    { key: "video", icon: <FaVideo />, label: "Video Call" },
    { key: "notifications", icon: <FaBell />, label: "Notifications" },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
        {!isCollapsed && <h2 className="logo">📚 EduConnect</h2>}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`menu-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => setActivePage(item.key)}
            title={item.label}
          >
            <span className="menu-icon">{item.icon}</span>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout} title="Logout">
        <FaSignOutAlt />
        {!isCollapsed && "Logout"}
      </button>
    </div>
  );
};

export default Sidebar;