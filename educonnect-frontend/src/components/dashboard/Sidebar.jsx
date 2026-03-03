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
        <FaBars
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
        {!isCollapsed && <h2 className="logo">EduConnect</h2>}
      </div>

      {menuItems.map((item) => (
        <button
          key={item.key}
          className={activePage === item.key ? "active" : ""}
          onClick={() => setActivePage(item.key)}
        >
          {item.icon}
          {!isCollapsed && item.label}
        </button>
      ))}

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt />
        {!isCollapsed && "Logout"}
      </button>
    </div>
  );
};

export default Sidebar;