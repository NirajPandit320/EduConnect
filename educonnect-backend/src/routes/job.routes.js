const express = require("express");
const router = express.Router();
const { checkEligibility } = require("../controllers/job.controller");
const isAdmin = require("../middleware/admin.middleware");

const {
  createJob,
  getJobs,
  getJobById,
  deleteJob,
} = require("../controllers/job.controller");

router.post("/", isAdmin, createJob);
router.get("/", getJobs);
router.get("/eligibility/:uid", checkEligibility);
router.get("/:id", getJobById);
router.delete("/:id", isAdmin, deleteJob);
module.exports = router;