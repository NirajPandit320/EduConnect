
const Post = require("../models/Post");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    console.log("Incoming post body:", req.body);
    const { userId, content } = req.body;

    const newPost = await Post.create({ userId, content });

    res.status(201).json({
      message: "Post created",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Post creation failed",
      error: error.message,
    });
  }
};

// GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Fetching posts failed",
      error: error.message,
    });
  }
};

// LIKE / UNLIKE
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Like failed",
      error: error.message,
    });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    const post = await Post.findById(postId);

    post.comments.push({ userId, text });

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Comment failed",
      error: error.message,
    });
  }
};