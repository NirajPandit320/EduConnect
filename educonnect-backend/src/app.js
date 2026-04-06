const express = require("express");
const app = express();
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const eventRoutes = require("./routes/event.routes");
const messageRoutes = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resources", require("./routes/resource.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));


app.get("/", (req, res) => {
  res.send("Server is running");
});



module.exports = app;