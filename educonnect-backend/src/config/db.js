const mongoose = require("mongoose");

// function that connects to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB failed to connect ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;