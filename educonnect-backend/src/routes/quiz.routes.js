const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizzes,
  deleteQuiz,
  submitQuiz,
  getQuizAttempts,
} = require("../controllers/quiz.controller");

const isAdmin = require("../middleware/admin.middleware");

router.post("/", isAdmin, createQuiz);
router.get("/", getQuizzes);
router.delete("/:id", isAdmin, deleteQuiz);
router.post("/:id/submit", submitQuiz);
router.get("/attempts/:uid", getQuizAttempts);

module.exports = router;