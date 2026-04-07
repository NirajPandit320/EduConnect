const express = require("express");
const router = express.Router();
const { checkEligibility } = require("../controllers/job.controller");

const {
  createJob,
  getJobs,
  getJobById,
} = require("../controllers/job.controller");

router.post("/", createJob);
router.get("/", getJobs);
router.get("/eligibility/:uid", checkEligibility);
router.get("/:id", getJobById);
module.exports = router;