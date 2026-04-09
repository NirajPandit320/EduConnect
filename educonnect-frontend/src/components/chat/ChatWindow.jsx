import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "../../socket";
import { API_BASE_URL } from "../../utils/apiConfig";

const RTC_CONFIGURATION = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ChatWindow = ({ currentUser, selectedUser, onCloseChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  const [callType, setCallType] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [callBanner, setCallBanner] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingOfferRef = useRef(null);
  const incomingFromRef = useRef(null);
  const localMediaRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const reactionOptions = ["👍", "❤️", "😂", "🔥", "🎉", "😮"];

  useEffect(() => {
    if (currentUser?.uid) {
      socket.emit("join", currentUser.uid);
      socket.emit("register", currentUser.uid);
    }
  }, [currentUser]);

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

  const fetchMessages = useCallback(async () => {
    if (!currentUser?.uid || !selectedUser?.uid) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/${currentUser.uid}/${selectedUser.uid}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch messages error:", error);
      setMessages([]);
    }
  }, [currentUser?.uid, selectedUser?.uid]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const onReceiveMessage = (data) => {
      const isConversationMessage =
        (data.sender === selectedUser?.uid && data.receiver === currentUser?.uid) ||
        (data.sender === currentUser?.uid && data.receiver === selectedUser?.uid);

      if (isConversationMessage) {
        setMessages((prev) => mergeMessages(prev, [data]));
      }
    };

    socket.on("receive_message", onReceiveMessage);
    return () => socket.off("receive_message", onReceiveMessage);
  }, [selectedUser?.uid, currentUser?.uid, mergeMessages]);

  useEffect(() => {
    const onUserTyping = (senderUid) => {
      if (senderUid === selectedUser?.uid) {
        setIsTyping(true);
      }
    };

    const onUserStopTyping = (senderUid) => {
      if (senderUid === selectedUser?.uid) {
        setIsTyping(false);
      }
    };

    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);

    return () => {
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
    };
  }, [selectedUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid || !selectedUser?.uid) return;

    fetch(`${API_BASE_URL}/api/messages/seen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: selectedUser.uid,
        receiver: currentUser.uid,
      }),
    }).catch((error) => {
      console.error("Mark seen failed:", error);
    });
  }, [selectedUser?.uid, currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid || !selectedUser?.uid) return;

    const intervalId = setInterval(() => {
      fetchMessages();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [currentUser?.uid, selectedUser?.uid, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localMediaRef.current) {
      localMediaRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const resetCallState = useCallback(() => {
    incomingOfferRef.current = null;
    incomingFromRef.current = null;
    setCallState("idle");
    setCallType(null);
    setIsMicMuted(false);
    setIsVideoEnabled(true);
  }, []);

  const cleanupCall = useCallback(() => {
    closePeerConnection();
    stopLocalStream();
    resetCallState();
  }, [closePeerConnection, stopLocalStream, resetCallState]);

  const startLocalMedia = useCallback(async (mode) => {
    const constraints =
      mode === "video" ? { audio: true, video: true } : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    if (localMediaRef.current) {
      localMediaRef.current.srcObject = stream;
    }

    setIsMicMuted(false);
    setIsVideoEnabled(mode === "video");

    return stream;
  }, []);

  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;

    const nextMuted = !isMicMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMicMuted(nextMuted);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current || callType !== "video") return;

    const nextEnabled = !isVideoEnabled;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsVideoEnabled(nextEnabled);
  };

  const setupPeerConnection = useCallback(
    (targetUid, stream) => {
      const pc = new RTCPeerConnection(RTC_CONFIGURATION);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }

        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate || !currentUser?.uid) return;

        socket.emit("ice-candidate", {
          to: targetUid,
          from: currentUser.uid,
          candidate: event.candidate,
        });
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;

        if (state === "connected") {
          setCallState("connected");
          setCallBanner("");
        }

        if (state === "failed" || state === "disconnected" || state === "closed") {
          cleanupCall();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [cleanupCall, currentUser?.uid]
  );

  useEffect(() => {
    const onIncomingCall = ({ offer, from, type }) => {
      if (!offer || !from || from !== selectedUser?.uid) return;

      incomingOfferRef.current = offer;
      incomingFromRef.current = from;
      setCallType(type || "audio");
      setCallState("incoming");
      setCallBanner("Incoming call...");
    };

    const onCallAccepted = async ({ answer, from, type }) => {
      if (!answer || from !== selectedUser?.uid || !peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallType(type || callType || "audio");
        setCallState("connected");
        setCallBanner("");
      } catch (error) {
        console.error("Call accept handling failed:", error);
        cleanupCall();
      }
    };

    const onIceCandidate = async ({ candidate, from }) => {
      if (!candidate || from !== selectedUser?.uid || !peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE candidate add failed:", error);
      }
    };

    const onCallEnded = ({ from }) => {
      if (from !== selectedUser?.uid) return;

      setCallBanner("Call ended");
      cleanupCall();
      setTimeout(() => setCallBanner(""), 1800);
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-accepted", onCallAccepted);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("call-ended", onCallEnded);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-accepted", onCallAccepted);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("call-ended", onCallEnded);
    };
  }, [callType, cleanupCall, selectedUser?.uid]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      cleanupCall();
    };
  }, [cleanupCall]);

  useEffect(() => {
    setCallBanner("");
    cleanupCall();
  }, [selectedUser?.uid, cleanupCall]);

  const startCall = async (mode) => {
    if (!currentUser?.uid || !selectedUser?.uid || callState !== "idle") return;

    try {
      setCallType(mode);
      setCallState("calling");
      setCallBanner(`Calling ${selectedUser.name || selectedUser.email || "user"}...`);

      const stream = await startLocalMedia(mode);
      const pc = setupPeerConnection(selectedUser.uid, stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", {
        to: selectedUser.uid,
        from: currentUser.uid,
        offer,
        type: mode,
      });
    } catch (error) {
      console.error("Start call failed:", error);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!currentUser?.uid || !incomingOfferRef.current || !incomingFromRef.current) return;

    try {
      const mode = callType || "audio";
      const stream = await startLocalMedia(mode);
      const pc = setupPeerConnection(incomingFromRef.current, stream);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: incomingFromRef.current,
        from: currentUser.uid,
        answer,
        type: mode,
      });

      setCallState("connected");
      setCallBanner("");
    } catch (error) {
      console.error("Accept call failed:", error);
      cleanupCall();
    }
  };

  const endCall = () => {
    if (currentUser?.uid && selectedUser?.uid && callState !== "idle") {
      socket.emit("end-call", {
        to: selectedUser.uid,
        from: currentUser.uid,
      });
    }

    cleanupCall();
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!currentUser?.uid || !selectedUser?.uid) return;

    let fileDataUrl = "";

    if (selectedFile) {
      try {
        fileDataUrl = await fileToDataUrl(selectedFile);
      } catch (error) {
        console.error("File read failed:", error);
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
      socket.emit("send_message", messageData);

      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const payload = await res.json();
      const savedMessage = payload?.data;

      setMessages((prev) =>
        mergeMessages(prev, [
          savedMessage || { ...messageData, _id: Date.now(), seen: false },
        ])
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

        <div className="chat-header-actions">
          <button
            type="button"
            className={`chat-call-btn audio ${callType === "audio" && callState !== "idle" ? "active" : ""}`}
            onClick={() => startCall("audio")}
            disabled={callState !== "idle"}
            title="Start audio call"
          >
            <span className="chat-call-btn-icon">☎</span>
            <span>Audio</span>
          </button>

          <button
            type="button"
            className={`chat-call-btn video ${callType === "video" && callState !== "idle" ? "active" : ""}`}
            onClick={() => startCall("video")}
            disabled={callState !== "idle"}
            title="Start video call"
          >
            <span className="chat-call-btn-icon">▣</span>
            <span>Video</span>
          </button>

          <button className="chat-close-btn" onClick={onCloseChat} type="button">
            ✖
          </button>
        </div>
      </div>

      {callBanner ? <div className="chat-call-banner">{callBanner}</div> : null}

      {callState !== "idle" ? (
        <div className="chat-call-stage">
          {(callState === "calling" || callState === "connected") && (
            <div className="chat-call-media-grid">
              {callType === "video" ? (
                <video className="chat-call-remote-video" ref={remoteVideoRef} autoPlay playsInline />
              ) : (
                <div className="chat-call-audio-pill">Audio call in progress</div>
              )}

              <audio ref={remoteAudioRef} autoPlay className="chat-call-remote-audio" />

              <video
                className={`chat-call-local-video ${callType === "audio" ? "audio-only" : ""}`}
                ref={localMediaRef}
                autoPlay
                muted
                playsInline
              />
            </div>
          )}

          {callState === "incoming" ? (
            <div className="chat-call-incoming-box">
              <p>
                Incoming {callType || "audio"} call from {selectedUser?.name || "user"}
              </p>
              <div className="chat-call-incoming-actions">
                <button type="button" className="chat-accept-btn" onClick={acceptCall}>
                  Accept
                </button>
                <button type="button" className="chat-decline-btn" onClick={endCall}>
                  Decline
                </button>
              </div>
            </div>
          ) : null}

          {(callState === "calling" || callState === "connected") ? (
            <div className="chat-call-controls">
              <button
                type="button"
                className="chat-call-toggle-btn"
                onClick={toggleMicrophone}
              >
                {isMicMuted ? "Unmute Mic" : "Mute Mic"}
              </button>

              {callType === "video" ? (
                <button
                  type="button"
                  className="chat-call-toggle-btn"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? "Disable Video" : "Enable Video"}
                </button>
              ) : null}

              <button type="button" className="chat-end-call-btn" onClick={endCall}>
                End Call
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="chat-messages-container">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={getMessageKey(msg)}
              className={`chat-message ${msg.sender === currentUser.uid ? "sent" : "received"}`}
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
                      Attachment: {msg.fileName || "Open"}
                    </a>
                  )}
                </div>
              ) : null}

              <div className="chat-message-meta">
                <span className="chat-message-time">{formatTimestamp(msg.createdAt)}</span>

                {msg.sender === currentUser.uid ? (
                  <span className={`chat-seen-status ${msg.seen ? "seen-animated" : ""}`}>
                    {msg.seen ? "Seen" : "Sent"}
                  </span>
                ) : null}
              </div>

              <div className="chat-reactions-row">
                {reactionOptions.map((emoji) => (
                  <button
                    type="button"
                    key={`${getMessageKey(msg)}-${emoji}`}
                    className={`chat-reaction-chip ${(messageReactions[getMessageKey(msg)] || []).includes(emoji) ? "active" : ""}`}
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

        {isTyping ? <div className="chat-typing-indicator">Typing...</div> : null}

        <div ref={messagesEndRef} />
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

        <button className="chat-send-btn" onClick={handleSend} type="button">
          Send
        </button>
      </div>

      {selectedFile ? (
        <div className="chat-selected-file-bar">
          <span className="chat-selected-file-name">Attachment: {selectedFile.name}</span>
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
