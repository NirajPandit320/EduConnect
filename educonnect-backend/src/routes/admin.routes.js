const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminLogout,
  getAdminStats,
  deletePostAdmin,
  deleteEventAdmin,
  updateEventStatusAdmin,
} = require("../controllers/admin.controller");
const isAdmin = require("../middleware/admin.middleware");

// Public routes
router.post("/login", adminLogin);

// Protected routes (require admin session)
router.post("/logout", isAdmin, adminLogout);
router.get("/stats", isAdmin, getAdminStats);

// Admin moderation
router.delete("/posts/:id", isAdmin, deletePostAdmin);
router.patch("/events/:id/status", isAdmin, updateEventStatusAdmin);
router.delete("/events/:id", isAdmin, deleteEventAdmin);

module.exports = router;