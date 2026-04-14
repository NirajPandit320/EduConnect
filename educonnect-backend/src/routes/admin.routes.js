const express = require("express");
const router = express.Router();

const isAdmin = require("../middleware/admin.middleware");

const {
  adminLogin,
  getAdminStats,
  getAllUsersAdmin,
  deleteUserAdmin,
  getAllPostsAdmin,
  deletePostAdmin,
  getAllEventsAdmin,
  deleteEventAdmin,
} = require("../controllers/admin.controller");

router.post("/login", adminLogin);

// DASHBOARD
router.get("/stats", isAdmin, getAdminStats);

// USERS
router.get("/users", isAdmin, getAllUsersAdmin);
router.delete("/users/:id", isAdmin, deleteUserAdmin);

// POSTS
router.get("/posts", isAdmin, getAllPostsAdmin);
router.delete("/posts/:id", isAdmin, deletePostAdmin);

// EVENTS
router.get("/events", isAdmin, getAllEventsAdmin);
router.delete("/events/:id", isAdmin, deleteEventAdmin);

module.exports = router;