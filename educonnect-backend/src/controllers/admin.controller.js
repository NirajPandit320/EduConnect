const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");

exports.adminLogin = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password are required",
      data: null,
    });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Admin login successful",
      data: { isAdmin: true },
      isAdmin: true,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
    data: null,
  });
};

exports.getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const posts = await Post.countDocuments();
    const events = await Event.countDocuments();

    res.json({
      success: true,
      message: "Admin stats fetched",
      data: { users, posts, events },
      users,
      posts,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      data: null,
      error: error.message,
    });
  }
};

exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      data: null,
      error: error.message,
    });
  }
};

exports.deleteUserAdmin = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "User deleted",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      data: null,
      error: error.message,
    });
  }
};

exports.getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      data: null,
      error: error.message,
    });
  }
};

exports.deletePostAdmin = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Post deleted",
      data: deletedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      data: null,
      error: error.message,
    });
  }
};

exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      data: null,
      error: error.message,
    });
  }
};

exports.deleteEventAdmin = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Event deleted",
      data: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      data: null,
      error: error.message,
    });
  }
};