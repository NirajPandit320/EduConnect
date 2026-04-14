const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  deletePostAdmin,
  deleteEventAdmin,
} = require("../controllers/admin.controller");

const { adminLogin } = require("../controllers/admin.controller");
const isAdmin = require("../middleware/admin.middleware");

// DASHBOARD
router.get("/stats", isAdmin, getAdminStats);

// POSTS
router.delete("/posts/:id", isAdmin, deletePostAdmin);

// EVENTS
router.delete("/events/:id", isAdmin, deleteEventAdmin);

module.exports = router;

router.post("/login", adminLogin);

module.exports = router;