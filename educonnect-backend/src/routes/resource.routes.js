const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadResource,
  getResources,
  updateResource,
  deleteResource,
  toggleLike,
  toggleBookmark,
  addComment,
  reportResource,
  incrementView,
  incrementDownload,
} = require("../controllers/resource.controller");

// Upload resources with multiple files
router.post("/", upload.array("files", 10), uploadResource);

// Get resources with filters
router.get("/", getResources);

// Update resource
router.put("/:id", upload.single("file"), updateResource);

// Delete resource
router.delete("/:id", deleteResource);

// Resource interactions
router.post("/:id/like", toggleLike);
router.post("/:id/bookmark", toggleBookmark);
router.post("/:id/comment", addComment);
router.post("/:id/report", reportResource);

// Analytics
router.post("/:id/view", incrementView);
router.post("/:id/download", incrementDownload);

module.exports = router;