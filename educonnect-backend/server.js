const connectDB = require("./src/config/db");
const http = require("http");
const app = require("./src/app");
const User = require("./src/models/User");
const { createAndEmitNotification } = require("./src/controllers/notification.controller");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

connectDB();

// START SERVER
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

//  NEW: Track online users for private chat
let onlineUsers = {};

const addSocketForUser = (uid, socketId) => {
  if (!onlineUsers[uid]) {
    onlineUsers[uid] = new Set();
  }

  onlineUsers[uid].add(socketId);
};

const removeSocketForUser = (uid, socketId) => {
  const sockets = onlineUsers[uid];
  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    delete onlineUsers[uid];
  }
};

const registerUserSocket = async (uid, socket, shouldPersistOnline = false) => {
  if (!uid) return;

  socket.join(uid);
  socket.userId = uid;
  addSocketForUser(uid, socket.id);

  if (shouldPersistOnline) {
    await User.findOneAndUpdate({ uid }, { isOnline: true });
  }

  io.emit("online_users", Object.keys(onlineUsers));
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (uid) => {
    if (!uid) return;

    registerUserSocket(uid, socket).catch((err) => {
      console.log("Join error:", err.message);
    });
  });

  socket.on("register", (uid) => {
    if (!uid) return;

    registerUserSocket(uid, socket).catch((err) => {
      console.log("Register error:", err.message);
    });
  });

  //  USER ONLINE STATUS (existing)

  socket.on("userOnline", async (uid) => {
    try {
      await registerUserSocket(uid, socket, true);

      console.log(`User ${uid} is online`);
    } catch (err) {
      console.log("Online error:", err.message);
    }
  });

  //  PRIVATE CHAT (NEW FEATURE)
  socket.on("send_message", (data) => {
    const { receiver } = data;

    if (!receiver) return;

    io.to(receiver).emit("receive_message", data);
  });

  //  WEBRTC SIGNALING (PRIVATE CALLS)
  socket.on("call-user", ({ to, from, offer, type }) => {
    if (!to || !from || !offer) return;

    io.to(to).emit("incoming-call", {
      from,
      offer,
      type: type || "audio",
    });

    createAndEmitNotification(io, {
      userId: to,
      senderId: from,
      type: "call",
      text: `Incoming ${type || "audio"} call`,
      link: "/chat",
    }).catch((error) => {
      console.log("Call notification failed:", error.message);
    });
  });

  socket.on("answer-call", ({ to, from, answer, type }) => {
    if (!to || !from || !answer) return;

    io.to(to).emit("call-accepted", {
      from,
      answer,
      type: type || "audio",
    });
  });

  socket.on("ice-candidate", ({ to, from, candidate }) => {
    if (!to || !from || !candidate) return;

    io.to(to).emit("ice-candidate", {
      from,
      candidate,
    });
  });

  socket.on("end-call", ({ to, from }) => {
    if (!to || !from) return;

    io.to(to).emit("call-ended", { from });
  });

  //  JOIN EVENT ROOM (existing)

  socket.on("joinEvent", (eventId) => {
    socket.join(eventId);
    console.log(`Joined room: ${eventId}`);
  });

  // LEAVE EVENT ROOM (existing)
 
  socket.on("leaveEvent", (eventId) => {
    socket.leave(eventId);
    console.log(`Left room: ${eventId}`);
  });

  //  GROUP MESSAGE (existing)
  
  socket.on("sendMessage", ({ eventId, message }) => {
    if (!eventId || !message) return;

    io.to(eventId).emit("receiveMessage", {
      message,
      senderId: socket.id,
      createdAt: new Date(),
    });
  });

  //  TYPING INDICATOR (existing)
  
  socket.on("typing", ({ eventId, user }) => {
    socket.to(eventId).emit("userTyping", user);
  });

  socket.on("stopTyping", ({ eventId, user }) => {
    socket.to(eventId).emit("userStoppedTyping", user);
  });

  //  DISCONNECT
  
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const uid = socket.userId;
    if (!uid) return;

    removeSocketForUser(uid, socket.id);
    io.emit("online_users", Object.keys(onlineUsers));

    if (!onlineUsers[uid]) {
      try {
        await User.findOneAndUpdate({ uid }, { isOnline: false });
        console.log(`User ${uid} is offline`);
      } catch (err) {
        console.log("Disconnect error:", err.message);
      }
    }
  });
  socket.on("typing_private", ({ sender, receiver }) => {
    if (!sender || !receiver) return;

    io.to(receiver).emit("user_typing", sender);
  });

  socket.on("stop_typing_private", ({ sender, receiver }) => {
    if (!sender || !receiver) return;

    io.to(receiver).emit("user_stop_typing", sender);
  });
});


// START SERVER
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});