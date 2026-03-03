const express = require("express");
const app = express();
const cors = require("cors");


const userRoutes = require("./routes/user.routes");
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});
const postRoutes = require("./routes/post.routes");
app.use("/api/posts", postRoutes);

module.exports = app;
