const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/educonnect"; // fallback for local

    await mongoose.connect(mongoURI);

    console.log("Mongo Connected ✅");
  } catch (error) {
    console.error("MongoDB failed to connect ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;