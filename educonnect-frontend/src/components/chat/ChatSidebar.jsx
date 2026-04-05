import { useEffect, useState } from "react";
import { socket } from "../../socket";

const ChatSidebar = ({ onSelectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  //  Listen for online users (socket)
  useEffect(() => {
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("online_users");
  }, []);

  //  Fetch users
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        const usersArray = data.users || data;

        if (Array.isArray(usersArray)) {
          setUsers(usersArray);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setUsers([]));
  }, []);

  //  Filter users
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-sidebar-container">
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-title-row">
          <h3 className="chat-sidebar-title">Chats</h3>
          <span className="chat-online-count">{onlineUsers.length} online</span>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="chat-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="chat-user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            if (u.uid === currentUser?.uid) return null;

            return (
              <div
                key={u.uid}
                className={`chat-user-item ${
                  selectedUserId === u.uid ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedUserId(u.uid);
                  onSelectUser(u);
                }}
              >
                <div className="chat-user-avatar">
                  {u.name?.charAt(0)}
                </div>

                <div className="chat-user-info">
                  <div className="chat-user-name">
                    {u.name}
                    {onlineUsers.includes(u.uid) && (
                      <span className="chat-user-online-dot"></span>
                    )}
                  </div>

                  <div className="chat-user-last-message">
                    {onlineUsers.includes(u.uid) ? "Online now" : "Tap to start chat"}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="chat-no-users">No users found</div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;