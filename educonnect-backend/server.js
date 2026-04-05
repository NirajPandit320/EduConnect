const connectDB = require("./src/config/db");
const http = require("http");
const app = require("./src/app");
const User = require("./src/models/User");

const { Server } = require("socket.io");

const PORT = 5000;

connectDB();

// ✅ SINGLE server instance
const server = http.createServer(app);

// ✅ Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 NEW: Track online users for private chat
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =========================
  // ✅ USER ONLINE STATUS (existing)
  // =========================
  socket.on("userOnline", async (uid) => {
    try {
      socket.userId = uid;

      // 🔥 also store for private chat
      onlineUsers[uid] = socket.id;

      await User.findOneAndUpdate({ uid }, { isOnline: true });

      // 🔥 broadcast online users
      io.emit("online_users", Object.keys(onlineUsers));

      console.log(`User ${uid} is online`);
    } catch (err) {
      console.log("Online error:", err.message);
    }
  });

  // =========================
  // ✅ PRIVATE CHAT (NEW 🔥)
  // =========================
  socket.on("send_message", (data) => {
    const { receiver } = data;

    const receiverSocket = onlineUsers[receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", data);
    }
  });

  // =========================
  // ✅ JOIN EVENT ROOM (existing)
  // =========================
  socket.on("joinEvent", (eventId) => {
    socket.join(eventId);
    console.log(`Joined room: ${eventId}`);
  });

  // =========================
  // ✅ LEAVE EVENT ROOM (existing)
  // =========================
  socket.on("leaveEvent", (eventId) => {
    socket.leave(eventId);
    console.log(`Left room: ${eventId}`);
  });

  // =========================
  // ✅ GROUP MESSAGE (existing)
  // =========================
  socket.on("sendMessage", ({ eventId, message }) => {
    if (!eventId || !message) return;

    io.to(eventId).emit("receiveMessage", {
      message,
      senderId: socket.id,
      createdAt: new Date(),
    });
  });

  // =========================
  // ✅ TYPING INDICATOR (existing)
  // =========================
  socket.on("typing", ({ eventId, user }) => {
    socket.to(eventId).emit("userTyping", user);
  });

  socket.on("stopTyping", ({ eventId, user }) => {
    socket.to(eventId).emit("userStoppedTyping", user);
  });

  // =========================
  // ✅ DISCONNECT
  // =========================
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    // 🔥 remove from private chat tracking
    for (let uid in onlineUsers) {
      if (onlineUsers[uid] === socket.id) {
        delete onlineUsers[uid];

        // 🔥 broadcast updated list
        io.emit("online_users", Object.keys(onlineUsers));

        try {
          await User.findOneAndUpdate(
            { uid },
            { isOnline: false }
          );

          console.log(`User ${uid} is offline`);
        } catch (err) {
          console.log("Disconnect error:", err.message);
        }
      }
    }
  });
  socket.on("typing_private", ({ sender, receiver }) => {
  const receiverSocket = onlineUsers[receiver];

  if (receiverSocket) {
    io.to(receiverSocket).emit("user_typing", sender);
  }
});

socket.on("stop_typing_private", ({ sender, receiver }) => {
  const receiverSocket = onlineUsers[receiver];

  if (receiverSocket) {
    io.to(receiverSocket).emit("user_stop_typing", sender);
  }
});
});


// ✅ START SERVER
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});