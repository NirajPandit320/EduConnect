const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
exports.createPost = async (req, res) => {
  try {

    const { uid, content } = req.body;

    const imageFiles = req.files || [];

    const images = imageFiles.map(file => file.filename);

    const newPost = await Post.create({
      uid,
      content,
      images,
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
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    console.log("Editing post:", postId);
    console.log("New content:", content);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post updated",
      post: updatedPost,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Edit failed",
      error: error.message,
    });
  }
};
exports.deletePost = async (req, res) => {

  try {

    const { postId } = req.params;

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.status(200).json({
      message: "Post deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });

  }

};