const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: [1, "Post content cannot be empty"],
      maxlength: [5000, "Post content cannot exceed 5000 characters"],
      trim: true,
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return !v || typeof v === "string"; // Allow empty or string
          },
        },
      },
    ],
    likes: [
      {
        type: String,
      },
    ],
    comments: [
      {
        uid: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
postSchema.index({ uid: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);