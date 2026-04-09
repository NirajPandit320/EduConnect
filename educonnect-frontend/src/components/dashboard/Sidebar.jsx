import { useEffect, useRef, useState } from "react";

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
  const menuRef = useRef(null);
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

  useEffect(() => {
    const nav = menuRef.current;
    if (!nav) return;

    const activeItem = nav.querySelector(".menu-item.active");
    if (!activeItem) return;

    activeItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activePage, isCollapsed]);

  const handleMenuClick = (key) => {
    setActivePage(key);

    if (key === "notifications") {
      setUnreadCount(0);
      setRingBell(false);
      clearTimeout(ringTimeoutRef.current);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const sidebarClasses = ["sidebar", isCollapsed ? "collapsed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClasses}>
      <div className="sidebar-top">
        <button
          type="button"
          className="collapse-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          <FaBars />
        </button>
        {!isCollapsed && (
          <div className="sidebar-brand" aria-label="EduConnect">
            <img
              src="/EduconnectLogo.png"
              alt="EduConnect"
              className="sidebar-brand-logo"
            />
            <span className="sidebar-brand-text">EduConnect</span>
          </div>
        )}
      </div>

      <nav className="sidebar-menu" ref={menuRef}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`menu-item sidebar-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => handleMenuClick(item.key)}
            title={item.label}
            aria-label={item.label}
          >
            <span
              className={`menu-icon sidebar-icon ${
                item.key === "notifications" && ringBell ? "bell-ring" : ""
              }`}
            >
              {item.icon}
              {item.key === "notifications" && unreadCount > 0 ? (
                <span
                  className="notification-badge"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </span>
            <span className="menu-label sidebar-text">{item.label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="logout-btn" onClick={handleLogout} title="Logout">
        <FaSignOutAlt />
        <span className="menu-label">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;