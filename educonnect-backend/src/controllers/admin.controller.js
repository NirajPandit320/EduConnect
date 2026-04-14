const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");

exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Admin login successful",
      isAdmin: true,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
};
const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");

// DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const posts = await Post.countDocuments();
    const events = await Event.countDocuments();

    res.json({
      users,
      posts,
      events,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE ANY POST
exports.deletePostAdmin = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted by admin" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE EVENT
exports.deleteEventAdmin = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted by admin" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};