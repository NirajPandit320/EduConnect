import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io("http://localhost:5000");

const EventChat = ({ eventId, onClose }) => {
  const { user } = useSelector((state) => state.user);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("joinEvent", eventId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [eventId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      user: user.name || user.email,
      text: message,
    };

    socket.emit("sendMessage", {
      eventId,
      message: msgData,
    });

    setMessages((prev) => [...prev, msgData]);
    setMessage("");

    
  };

  return (
    <div className="event-chat-modal">
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 Event Chat</h3>
          <button
            className="close-chat"
            onClick={onClose}
            title="Close chat"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="message-bubble">
                <div className="message-author">{msg.user}</div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventChat;