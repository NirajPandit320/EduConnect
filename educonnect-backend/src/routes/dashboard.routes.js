const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboard.controller");

router.get("/:uid", getDashboardStats);

module.exports = router;