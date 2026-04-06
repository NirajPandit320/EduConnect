const express = require("express");
const router = express.Router();
const {
  getLeaderboard,
  getPersonalRank,
} = require("../controllers/leaderboard.controller");

router.get("/", getLeaderboard);
router.get("/:uid", getPersonalRank);

module.exports = router;