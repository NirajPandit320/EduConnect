import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { socket } from "../../socket";


const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const {user} = useSelector((state) => state.user);

  useEffect(() => {
  if (user?.uid) {
    socket.emit("join", user.uid);
  }
}, [user]);

  return (
    <div className="chat-layout">
      <ChatSidebar onSelectUser={setSelectedUser} currentUser={user} />

      {selectedUser ? (
        <ChatWindow
          currentUser={user}
          selectedUser={selectedUser}
          onCloseChat={() => setSelectedUser(null)}
        />
      ) : (
        <div className="chat-empty-state">
          <div className="chat-empty-icon">💬</div>
          <h2>Welcome to EduConnect Chat</h2>
          <p>Choose a conversation from the left panel to start messaging.</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;