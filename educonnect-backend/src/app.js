const express = require("express");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/user.routes");

app.use(cors());              // ⭐ VERY IMPORTANT
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is response from server");
});

app.use("/api/users", userRoutes);

module.exports = app;






