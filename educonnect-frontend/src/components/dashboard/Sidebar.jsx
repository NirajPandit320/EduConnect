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
  FaTimes,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/userSlice";
import { socket } from "../../socket";
import { API_BASE_URL } from "../../utils/apiConfig";

const MOBILE_BREAKPOINT = 768;


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
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
    const updateViewport = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;

      setIsMobileView(mobile);

      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobileView && !isMobileOpen) return;

    const nav = menuRef.current;
    if (!nav) return;

    const activeItem = nav.querySelector(".menu-item.active");
    if (!activeItem) return;

    activeItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activePage, isMobileView, isMobileOpen, isCollapsed]);

  const handleMenuClick = (key) => {
    setActivePage(key);

    if (isMobileView) {
      setIsMobileOpen(false);
    }

    if (key === "notifications") {
      setUnreadCount(0);
      setRingBell(false);
      clearTimeout(ringTimeoutRef.current);
    }
  };

  const toggleSidebar = () => {
    if (isMobileView) {
      setIsMobileOpen((prev) => !prev);
      return;
    }

    setIsCollapsed((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const sidebarClasses = [
    "sidebar",
    isCollapsed ? "collapsed" : "",
    isMobileView ? "sidebar-mobile" : "",
    isMobileView ? (isMobileOpen ? "is-mobile-open" : "is-mobile-closed") : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isMobileView && !isMobileOpen ? (
        <button
          type="button"
          className="sidebar-mobile-toggle"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          aria-expanded="false"
        >
          <FaBars />
          <span>Menu</span>
        </button>
      ) : null}

      {isMobileView && isMobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar backdrop"
        />
      ) : null}

      <aside className={sidebarClasses}>
        <div className="sidebar-top">
          <button
            type="button"
            className="collapse-btn"
            onClick={toggleSidebar}
            title={
              isMobileView
                ? isMobileOpen
                  ? "Close sidebar"
                  : "Open sidebar"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-label={
              isMobileView
                ? isMobileOpen
                  ? "Close sidebar"
                  : "Open sidebar"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-expanded={isMobileView ? isMobileOpen : !isCollapsed}
          >
            {isMobileView ? (isMobileOpen ? <FaTimes /> : <FaBars />) : <FaBars />}
          </button>
          {(!isCollapsed || isMobileView) && (
            <h2 className="logo">📚 EduConnect</h2>
          )}
        </div>

        <nav className="sidebar-menu" ref={menuRef}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
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
                  <span
                    className="notification-badge"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt />
          <span className="menu-label">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;