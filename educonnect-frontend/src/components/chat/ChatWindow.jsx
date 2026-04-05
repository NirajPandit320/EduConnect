import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "../../socket";

const ChatWindow = ({ currentUser, selectedUser, onCloseChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const reactionOptions = ["👍", "❤️", "😂", "🔥", "🎉", "😮"];

  const getMessageKey = useCallback((msg) => {
    if (msg?._id) return String(msg._id);

    return [
      msg?.sender || "",
      msg?.receiver || "",
      msg?.createdAt || "",
      msg?.text || "",
      msg?.fileName || msg?.file || "",
    ].join("-");
  }, []);

  const mergeMessages = useCallback(
    (prev, incoming) => {
      const merged = [...prev];
      const seenKeys = new Set(prev.map((msg) => getMessageKey(msg)));

      incoming.forEach((msg) => {
        const key = getMessageKey(msg);
        if (!seenKeys.has(key)) {
          merged.push(msg);
          seenKeys.add(key);
        }
      });

      return merged.sort(
        (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
      );
    },
    [getMessageKey]
  );

  const formatTimestamp = useCallback((value) => {
    if (!value) return "";

    if (value?.seconds) {
      return new Date(value.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";

    return dt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const isImageAttachment = useCallback((msg) => {
    if (msg?.fileType?.startsWith("image/")) return true;
    if (msg?.fileName?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return true;
    return typeof msg?.file === "string" && msg.file.startsWith("data:image");
  }, []);

  const fileToDataUrl = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  // FETCH MESSAGES
  
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

  // REAL-TIME RECEIVE
  
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const isConversationMessage =
        (data.sender === selectedUser?.uid &&
          data.receiver === currentUser?.uid) ||
        (data.sender === currentUser?.uid &&
          data.receiver === selectedUser?.uid);

      if (isConversationMessage) {
        setMessages((prev) => mergeMessages(prev, [data]));
      }
    });

    return () => socket.off("receive_message");
  }, [selectedUser, currentUser, mergeMessages]);

  // TYPING LISTENER
  
  useEffect(() => {
    socket.on("user_typing", (senderUid) => {
      if (senderUid === selectedUser?.uid) {
        setIsTyping(true);
      }
    });

    socket.on("user_stop_typing", (senderUid) => {
      if (senderUid === selectedUser?.uid) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [selectedUser]);

  
  //  MARK AS SEEN (ONLY ONCE)
  
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

  // Keep seen ticks and timestamps fresh while chat is open.
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const intervalId = setInterval(() => {
      fetchMessages();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [currentUser, selectedUser, fetchMessages]);

  //  AUTO SCROLL
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

 
  //  SEND MESSAGE
  
  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!currentUser?.uid || !selectedUser?.uid) return;

    let fileDataUrl = "";

    if (selectedFile) {
      try {
        fileDataUrl = await fileToDataUrl(selectedFile);
      } catch (error) {
        console.error("File read error:", error);
        return;
      }
    }

    const messageData = {
      sender: currentUser.uid,
      receiver: selectedUser.uid,
      text: input.trim(),
      file: fileDataUrl,
      fileName: selectedFile?.name || "",
      fileType: selectedFile?.type || "",
      createdAt: new Date().toISOString(),
    };

    try {
      // instant socket
      socket.emit("send_message", messageData);

      //  save in DB
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const payload = await res.json();
      const savedMessage = payload?.data;

      // UI update
      setMessages((prev) =>
        mergeMessages(prev, [savedMessage || { ...messageData, _id: Date.now(), seen: false }])
      );

      setInput("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      socket.emit("stop_typing_private", {
        sender: currentUser.uid,
        receiver: selectedUser.uid,
      });
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  
  //  HANDLE TYPING
  
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

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addReaction = (msg, emoji) => {
    const key = getMessageKey(msg);
    setMessageReactions((prev) => {
      const existing = prev[key] || [];
      if (existing.includes(emoji)) {
        return {
          ...prev,
          [key]: existing.filter((item) => item !== emoji),
        };
      }

      return {
        ...prev,
        [key]: [...existing, emoji],
      };
    });
  };

  //  ENTER KEY
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
              key={getMessageKey(msg)}
              className={`chat-message ${
                msg.sender === currentUser.uid ? "sent" : "received"
              }`}
            >
              {msg.text ? <div className="chat-message-text">{msg.text}</div> : null}

              {msg.file ? (
                <div className="chat-attachment-wrap">
                  {isImageAttachment(msg) ? (
                    <a href={msg.file} target="_blank" rel="noreferrer">
                      <img
                        src={msg.file}
                        alt={msg.fileName || "attachment"}
                        className="chat-attachment-image"
                      />
                    </a>
                  ) : (
                    <a
                      href={msg.file}
                      target="_blank"
                      rel="noreferrer"
                      className="chat-attachment-link"
                    >
                      📎 {msg.fileName || "Open attachment"}
                    </a>
                  )}
                </div>
              ) : null}

              <div className="chat-message-meta">
                <span className="chat-message-time">
                  {formatTimestamp(msg.createdAt)}
                </span>

                {msg.sender === currentUser.uid ? (
                  <span
                    className={`chat-seen-status ${msg.seen ? "seen-animated" : ""}`}
                  >
                    {msg.seen ? "✔✔ Seen" : "✔ Sent"}
                  </span>
                ) : null}
              </div>

              <div className="chat-reactions-row">
                {reactionOptions.map((emoji) => (
                  <button
                    type="button"
                    key={`${getMessageKey(msg)}-${emoji}`}
                    className={`chat-reaction-chip ${
                      (messageReactions[getMessageKey(msg)] || []).includes(emoji)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => addReaction(msg, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

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
          type="file"
          ref={fileInputRef}
          className="chat-file-input"
          onChange={handleFilePick}
        />

        <button
          type="button"
          className="chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Attach
        </button>

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

      {selectedFile ? (
        <div className="chat-selected-file-bar">
          <span className="chat-selected-file-name">📎 {selectedFile.name}</span>
          <button
            type="button"
            className="chat-remove-file-btn"
            onClick={removeSelectedFile}
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatWindow;