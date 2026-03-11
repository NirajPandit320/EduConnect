const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  editPost,
  deletePost
} = require("../controllers/post.controller");

router.post("/", upload.array("images", 5), createPost);

router.get("/", getPosts);

router.put("/:postId/like", toggleLike);

router.put("/:postId/comment", addComment);

router.put("/:postId/edit", editPost);

router.delete("/:postId", deletePost);

module.exports = router;