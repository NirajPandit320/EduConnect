const express = require("express");
const cors = require("cors");
const userRoutes=require("./routes/user.routes");

const app = express();


app.use(cors());              // VERY IMPORTANT
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is response from server");
});

app.use("/api/users", userRoutes);
app.use(express.json());

module.exports = app;






