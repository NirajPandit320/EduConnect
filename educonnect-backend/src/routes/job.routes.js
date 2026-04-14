const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  checkEligibility,
  deleteJob,
} = require("../controllers/job.controller");

// Create job (admin only)
router.post("/", createJob);

// Get all jobs (with pagination & filtering)
router.get("/", getJobs);

// Check eligibility (must come before /:id)
router.get("/eligibility/:uid", checkEligibility);

// Get single job by ID
router.get("/:id", getJobById);

// Delete job (admin only)
router.delete("/:jobId", deleteJob);

module.exports = router;