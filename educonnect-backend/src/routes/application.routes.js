const express = require("express");
const router = express.Router();

const {
  applyJob,
  getMyApplications,
  getApplicationForJob,
} = require("../controllers/application.controller");

router.post("/apply", applyJob);
router.get("/job/:jobId/user/:uid", getApplicationForJob);
router.get("/:uid", getMyApplications);

module.exports = router;