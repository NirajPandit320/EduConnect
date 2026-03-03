const Post = require("../models/Post");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ uid: uid });

    const totalPosts = posts.length;
    const totalLikes = posts.reduce(
      (acc, post) => acc + post.likes.length,
      0
    );

    const totalComments = posts.reduce(
      (acc, post) => acc + post.comments.length,
      0
    );

    res.json({
      totalPosts,
      totalLikes,
      totalComments,
    });
  } catch (error) {
    res.status(500).json({ message: "Stats error", error: error.message });
  }
};