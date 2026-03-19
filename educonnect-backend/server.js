const connectDB = require("./src/config/db");
const http = require("http");
const app = require("./src/app"); // ✅ already has express

const { Server } = require("socket.io");

const PORT = 5000;

connectDB();

//  SINGLE server instance
const server = http.createServer(app);


//  Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//  Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id); //  improved log

  // JOIN EVENT ROOM
  socket.on("joinEvent", (eventId) => {
    socket.join(eventId);
    console.log(`User joined event room: ${eventId}`); //  debug log added
  });

  // SEND MESSAGE
  socket.on("sendMessage", ({ eventId, message }) => {
    io.to(eventId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id); //  improved log
  });
});

// START SERVER
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});