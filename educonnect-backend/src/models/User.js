const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    //MAKING OPTIONAL
    sapId: {
      type: Number,
      required: false,
    },
    branch: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);