import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaHome,
  FaFileAlt,
  FaCalendarAlt,
  FaQuestionCircle,
  FaComments,
  FaBook,
  FaBriefcase,
  FaTrophy,
  FaUser,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/userSlice";
import { socket } from "../../socket";
import { API_BASE_URL } from "../../utils/apiConfig";


const Sidebar = ({
  setActivePage,
  activePage,
  isCollapsed,
  setIsCollapsed,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ringBell, setRingBell] = useState(false);
  const ringTimeoutRef = useRef(null);

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
    { key: "resources", icon: <FaBook />, label: "Resources" },
    { key: "placement", icon: <FaBriefcase />, label: "Placement" },
    { key: "leaderboard", icon: <FaTrophy />, label: "Leaderboard" },
    { key: "profile", icon: <FaUser />, label: "Profile" },
    { key: "settings", icon: <FaCog />, label: "Settings" },
    { key: "notifications", icon: <FaBell />, label: "Notifications" },
  ];

  useEffect(() => {
    if (!user?.uid) return undefined;

    fetch(`${API_BASE_URL}/api/notifications/${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setUnreadCount(0);
          return;
        }

        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => setUnreadCount(0));
  }, [user?.uid]);

  useEffect(() => {
    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
      setRingBell(true);

      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = setTimeout(() => {
        setRingBell(false);
      }, 900);
    };

    socket.on("receive_notification", handleNotification);

    return () => {
      socket.off("receive_notification", handleNotification);
      clearTimeout(ringTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activePage === "notifications") {
      setUnreadCount(0);
      setRingBell(false);
      clearTimeout(ringTimeoutRef.current);
    }
  }, [activePage]);

  const handleMenuClick = (key) => {
    setActivePage(key);

    if (key === "notifications") {
      setUnreadCount(0);
      setRingBell(false);
      clearTimeout(ringTimeoutRef.current);
    }
  };

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
            onClick={() => handleMenuClick(item.key)}
            title={item.label}
          >
            <span
              className={`menu-icon ${
                item.key === "notifications" && ringBell ? "bell-ring" : ""
              }`}
            >
              {item.icon}
              {item.key === "notifications" && unreadCount > 0 ? (
                <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </span>
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