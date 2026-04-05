import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "../../socket";

const ChatWindow = ({ currentUser, selectedUser, onCloseChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // =========================
  // 🔥 FETCH MESSAGES
  // =========================
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !selectedUser) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${currentUser.uid}/${selectedUser.uid}`
      );
      const data = await res.json();

      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch messages error:", error);
      setMessages([]);
    }
  }, [currentUser, selectedUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // =========================
  // ⚡ REAL-TIME RECEIVE
  // =========================
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        data.sender === selectedUser?.uid ||
        data.receiver === selectedUser?.uid
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedUser]);

  // =========================
  // ✍ TYPING LISTENER
  // =========================
  useEffect(() => {
    socket.on("user_typing", () => setIsTyping(true));
    socket.on("user_stop_typing", () => setIsTyping(false));

    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, []);

  // =========================
  // ✔ MARK AS SEEN (ONLY ONCE)
  // =========================
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    fetch("http://localhost:5000/api/messages/seen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: selectedUser.uid,
        receiver: currentUser.uid,
      }),
    });
  }, [selectedUser, currentUser]);

  // =========================
  // 📜 AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // 💬 SEND MESSAGE
  // =========================
  const handleSend = async () => {
    if (!input.trim()) return;
    if (!currentUser?.uid || !selectedUser?.uid) return;

    const messageData = {
      sender: currentUser.uid,
      receiver: selectedUser.uid,
      text: input,
    };

    try {
      // ⚡ instant socket
      socket.emit("send_message", messageData);

      // 💾 save in DB
      await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      // UI update
      setMessages((prev) => [
        ...prev,
        { ...messageData, _id: Date.now(), seen: false },
      ]);

      setInput("");
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  // =========================
  // ✍ HANDLE TYPING
  // =========================
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!currentUser?.uid || !selectedUser?.uid) return;

    socket.emit("typing_private", {
      sender: currentUser.uid,
      receiver: selectedUser.uid,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing_private", {
        sender: currentUser.uid,
        receiver: selectedUser.uid,
      });
    }, 800);
  };

  // =========================
  // ⌨ ENTER KEY
  // =========================
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        <div className="chat-window-user-wrap">
          <div className="chat-window-avatar">
            {(selectedUser?.name || selectedUser?.email || "U").charAt(0)}
          </div>
          <div className="chat-window-user-meta">
            <div className="chat-window-user">
              {selectedUser?.name || selectedUser?.email || "User"}
            </div>
            <div className="chat-window-subtitle">Private conversation</div>
          </div>
        </div>

        <button className="chat-close-btn" onClick={onCloseChat}>
          ✖
        </button>
      </div>

      <div className="chat-messages-container">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender === currentUser.uid ? "sent" : "received"
              }`}
            >
              <div className="chat-message-text">{msg.text}</div>

              {msg.sender === currentUser.uid && (
                <span className="chat-seen-status">
                  {msg.seen ? "✔✔" : "✔"}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="chat-no-messages">
            <div className="chat-no-messages-icon">🗨</div>
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {isTyping && (
          <div className="chat-typing-indicator">Typing...</div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type message..."
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
        />

        <button className="chat-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;