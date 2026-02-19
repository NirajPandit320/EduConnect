const express = require("express");
const app = express();

const userRoutes = require("./routes/user.routes");

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

module.exports = app;
