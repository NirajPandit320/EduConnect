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

const Sidebar = ({ setActivePage, activePage, isOpen, setIsOpen }) => {
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
    <>
      <div className="mobile-topbar">
        <FaBars onClick={() => setIsOpen(!isOpen)} />
        <h3>EduConnect</h3>
      </div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">EduConnect</h2>

        {menuItems.map((item) => (
          <button
            key={item.key}
            className={activePage === item.key ? "active" : ""}
            onClick={() => {
              setActivePage(item.key);
              setIsOpen(false);
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;