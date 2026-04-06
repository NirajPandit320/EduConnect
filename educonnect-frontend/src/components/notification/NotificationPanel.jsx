import { useEffect, useState } from "react";
import { socket } from "../../socket";

const NotificationPanel = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    message: "💬",
    like: "❤️",
    comment: "💭",
    event: "🎉",
    call: "📞",
    quiz: "🏆",
    post: "📝",
    default: "🔔",
  };

  // FETCH
  useEffect(() => {
    if (!user?.uid) return undefined;

    setLoading(true);
    fetch(`http://localhost:5000/api/notifications/${user.uid}`)
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user]);

  // REAL-TIME
  useEffect(() => {
    const handleNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on("receive_notification", handleNotification);

    return () => socket.off("receive_notification", handleNotification);
  }, []);

  const markRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Mark notification read failed:", error);
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div className="notification-shell">
      <div className="notification-hero">
        <div>
          <p className="notification-kicker">Activity feed</p>
          <h3>Notifications</h3>
        </div>
        <span className="notification-count">{notifications.length}</span>
      </div>

      {loading ? (
        <div className="notification-loading">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((n) => (
            <button
              key={n._id}
              type="button"
              className={`notification-card ${n.isRead ? "read" : "unread"}`}
              onClick={() => markRead(n._id)}
            >
              <div className={`notification-icon type-${n.type || "default"}`}>
                {iconMap[n.type] || iconMap.default}
              </div>

              <div className="notification-body">
                <div className="notification-row">
                  <p className="notification-text">{n.text}</p>
                  {!n.isRead ? <span className="notification-dot" /> : null}
                </div>

                <div className="notification-meta">
                  <span>{n.type || "update"}</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="notification-empty">
          <div className="notification-empty-icon">🔕</div>
          <h4>No notifications yet</h4>
          <p>Your messages, likes, comments, events, calls, and quiz results will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;