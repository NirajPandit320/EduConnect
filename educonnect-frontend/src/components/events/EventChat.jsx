import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io("http://localhost:5000");

const EventChat = ({ eventId }) => {
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
    <div className="chat-box">

      <h3>💬 Event Chat</h3>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
};

export default EventChat;