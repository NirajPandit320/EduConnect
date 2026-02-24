const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/post.controller");

router.post("/", createPost);
router.get("/", getPosts);
router.put("/:postId/like", toggleLike);
router.put("/:postId/comment", addComment);

router.get("/", (req, res) => {
  res.send("Posts route working");
});

module.exports = router;