const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

// CREATE QUIZ (Admin)
exports.createQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body || {};

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "title and questions are required",
        data: null,
      });
    }

    const hasInvalidQuestion = questions.some(
      (q) =>
        !q ||
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        !q.answer
    );

    if (hasInvalidQuestion) {
      return res.status(400).json({
        success: false,
        message: "Each question must include question, options (min 2), and answer",
        data: null,
      });
    }

    const quiz = await Quiz.create({ title, questions });

    res.status(201).json({
      success: true,
      message: "Quiz created",
      data: quiz,
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Quiz creation failed",
      data: null,
      error: error.message,
    });
  }
};

// GET ALL QUIZZES
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      data: null,
      error: error.message,
    });
  }
};

// DELETE QUIZ (Admin)
exports.deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
        data: null,
      });
    }

    await QuizAttempt.deleteMany({ quizId: deleted._id });

    res.json({
      success: true,
      message: "Quiz deleted",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Quiz delete failed",
      data: null,
      error: error.message,
    });
  }
};

// SUBMIT QUIZ ATTEMPT
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { userUid, answers = [] } = req.body || {};

    if (!userUid || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "userUid and answers array are required",
        data: null,
      });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
        data: null,
      });
    }

    const totalQuestions = quiz.questions.length;
    const score = quiz.questions.reduce((acc, question, index) => {
      return answers[index] === question.answer ? acc + 1 : acc;
    }, 0);

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const attempt = await QuizAttempt.findOneAndUpdate(
      { quizId: quiz._id, userUid },
      {
        quizId: quiz._id,
        userUid,
        answers,
        score,
        totalQuestions,
        percentage,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: attempt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Quiz submission failed",
      data: null,
      error: error.message,
    });
  }
};

// GET ATTEMPTS OF A USER
exports.getQuizAttempts = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "uid is required",
        data: null,
      });
    }

    const attempts = await QuizAttempt.find({ userUid: uid })
      .populate("quizId", "title")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Quiz attempts fetched",
      data: attempts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempts",
      data: null,
      error: error.message,
    });
  }
};