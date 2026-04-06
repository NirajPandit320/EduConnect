const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    resourceType: {
      type: String,
      enum: ["file", "link", "code", "repository", "video"],
      default: "file",
    },
    category: {
      type: String,
      enum: ["notes", "ppt", "docs", "image", "code", "repository", "video"],
      default: "notes",
    },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    tags: [{ type: String }],
    uploadedBy: { type: String, required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    version: { type: Number, default: 1 },
    likes: [{ type: String }],
    bookmarks: [{ type: String }],
    comments: [
      {
        uid: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        uid: { type: String, required: true },
        reason: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);