const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: String, // store uid instead of ObjectId
      },
    ],
    comments: [
      {
        uid: {
          type: String,
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);