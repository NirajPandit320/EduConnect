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
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    //  NEW FIELDS 

    points: {
      type: Number,
      default: 0, // for leaderboard
    },

    bio: {
      type: String,
      default: "",
    },

    avatar: {
      type: String, // URL (future: Cloudinary)
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },
    cgpa: {
    type: Number,
    required: false,
    default: 0,
    },

    githubUrl: {
      type: String,
      default: "",
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    settings: {
      appearance: {
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        color: { type: String, default: "indigo" },
        fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
      },
      notifications: {
        messages: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        events: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: { type: String, enum: ["public", "private"], default: "public" },
        blockedUsers: { type: [String], default: [] },
      },
      preferences: {
        language: { type: String, default: "en" },
        timezone: { type: String, default: "Asia/Kolkata" },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);