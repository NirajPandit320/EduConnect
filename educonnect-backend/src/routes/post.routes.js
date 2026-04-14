const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deleteComment,
  editPost,
  deletePost
} = require("../controllers/post.controller");

// Create post with image upload
router.post("/", upload.array("images", 5), createPost);

// Get all posts (with pagination)
router.get("/", getPosts);

// Like/Unlike post
router.put("/:postId/like", toggleLike);

// Add comment to post
router.put("/:postId/comment", addComment);

// Delete comment from post
router.delete("/:postId/comment/:commentId", deleteComment);

// Edit post
router.put("/:postId/edit", editPost);

// Delete post
router.delete("/:postId", deletePost);

module.exports = router;