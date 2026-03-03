const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    console.log("Incoming post body:", req.body);

    const { uid, content } = req.body;

    if (!uid || !content) {
      return res.status(400).json({
        message: "uid and content are required",
      });
    }

    const newPost = await Post.create({
      uid,
      content,
      likes: [],
      comments: [],
    });

    res.status(201).json(newPost);
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
    const posts = await Post.find().sort({ createdAt: -1 });

    // Attach user info manually using uid
    const postsWithUser = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ uid: post.uid });

        return {
          ...post.toObject(),
          userName: user ? user.name : "Unknown User",
        };
      })
    );

    res.status(200).json(postsWithUser);
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
    const { uid } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.includes(uid);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== uid);
    } else {
      post.likes.push(uid);
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
    const { uid, text } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      uid,
      text,
    });

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Comment failed",
      error: error.message,
    });
  }
};