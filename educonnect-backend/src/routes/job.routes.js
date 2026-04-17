const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/admin.middleware");

const {
  createJob,
  getJobs,
  getJobById,
  checkEligibility,
  updateJobStatus,
  deleteJob,
} = require("../controllers/job.controller");

// Create job (admin only)
router.post("/", isAdmin, createJob);

// Get all jobs (with pagination & filtering)
router.get("/", getJobs);

// Check eligibility (must come before /:id)
router.get("/eligibility/:uid", checkEligibility);

// Get single job by ID
router.get("/:id", getJobById);

// Update job status (admin only)
router.patch("/:id/status", isAdmin, updateJobStatus);

// Delete job (admin only)
router.delete("/:jobId", isAdmin, deleteJob);

module.exports = router;