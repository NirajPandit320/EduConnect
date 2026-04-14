const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
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

router.post(
  "/",
  upload.fields([
    { name: "files", maxCount: 10 },
    { name: "file", maxCount: 10 },
  ]),
  uploadResource
);
router.get("/", getResources);
router.put(
  "/:id",
  upload.fields([
    { name: "files", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateResource
);
router.delete("/:id", deleteResource);

router.post("/:id/like", toggleLike);
router.post("/:id/bookmark", toggleBookmark);
router.post("/:id/comment", addComment);
router.post("/:id/report", reportResource);

router.post("/:id/view", incrementView);
router.post("/:id/download", incrementDownload);

module.exports = router;