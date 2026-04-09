import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { saveScore } from "../../services/scoreService";

const Quiz = () => {
  const API =
    "https://opentdb.com/api.php?amount=10&category=18&type=multiple";
  const QUIZ_DURATION_SECONDS = 4 * 60;

  const { user } = useSelector((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [violationCount, setViolationCount] = useState(0);
  const [showFocusWarning, setShowFocusWarning] = useState(false);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const finishQuiz = useCallback((submittedAnswers = answers) => {
    if (finished) return;

    const finalScore = questions.reduce((total, question, index) => {
      return submittedAnswers[index] === question.correct ? total + 1 : total;
    }, 0);

    setScore(finalScore);
    setFinished(true);

    const total = questions.length;
    if (total > 0 && user?.uid) {
      saveScore(finalScore, total, user.uid);
    }
  }, [answers, finished, questions, user?.uid]);

  // FETCH QUESTIONS
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          const options = [...q.incorrect_answers, q.correct_answer];

          return {
            question: decodeHTML(q.question),
            correct: decodeHTML(q.correct_answer),
            options: shuffle(options.map(decodeHTML)),
          };
        });

        setQuestions(formatted);
        setAnswers(Array(formatted.length).fill(""));
      });
  }, []);

  // CONTINUOUS QUIZ TIMER
  useEffect(() => {
    if (finished || questions.length === 0) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishQuiz();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finished, questions.length, finishQuiz]);

  // ANTI-CHEAT: monitor tab/window focus changes
  useEffect(() => {
    if (finished || questions.length === 0) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        setViolationCount((prev) => prev + 1);
        setShowFocusWarning(true);
      }
    };

    const handleBlur = () => {
      setViolationCount((prev) => prev + 1);
      setShowFocusWarning(true);
    };

    const handleFocus = () => {
      setShowFocusWarning(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [finished, questions.length]);

  useEffect(() => {
    if (violationCount >= 3 && !finished) {
      finishQuiz();
    }
  }, [violationCount, finished, finishQuiz]);

  const handleSelectOption = (option) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = option;
      return copy;
    });
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      return;
    }

    finishQuiz();
  };

  const handleSkip = () => {
    handleNext();
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  };

  // RESTART
  const restartQuiz = () => {
    window.location.reload();
  };

  // LOADING
  if (questions.length === 0) return (
    <div className="quiz-container quiz-loading">
      <div className="loading-spinner"></div>
      <h2>Loading Quiz...</h2>
    </div>
  );

  // RESULT SCREEN
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-container quiz-result">
        <div className="result-icon">🎉</div>
        <h2 className="result-title">Quiz Complete!</h2>
        <div className="result-score-box">
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {questions.length}</span>
          </div>
          <div className="score-percentage">{percentage}%</div>
        </div>
        <p className="result-message">
          {percentage >= 80 ? "🌟 Excellent work!" : percentage >= 60 ? "👍 Good attempt!" : "💪 Keep practicing!"}
        </p>
        <button onClick={restartQuiz} className="restart-btn">Restart Quiz</button>
      </div>
    );
  }

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);
  const selected = answers[current] || "";

  return (
    <div className="quiz-container quiz-active">
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">Question {current + 1} / {questions.length}</span>
        </div>
        <div className={`timer ${timeLeft <= 30 ? "timer-warning" : ""}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {showFocusWarning ? (
        <div className="quiz-focus-warning">Focus lost detected. Keep quiz tab active.</div>
      ) : null}

      {violationCount > 0 ? (
        <div className="quiz-violation-text">
          Warning: {violationCount}/3 focus violations detected.
        </div>
      ) : null}

      <div className="quiz-body">
        <h2 className="question-text">{q.question}</h2>

        <div className="options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${selected === opt ? "selected" : ""}`}
              onClick={() => handleSelectOption(opt)}
            >
              <span className="option-label">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button
          onClick={handlePrevious}
          className="next-btn secondary"
          disabled={current === 0}
        >
          ← Previous Question
        </button>

        <button
          onClick={handleSkip}
          className="next-btn secondary"
        >
          Skip Question
        </button>

        <button
          onClick={handleNext}
          className="next-btn"
        >
          {current + 1 === questions.length ? "Finish" : "Next"} →
        </button>
      </div>
    </div>
  );
};

export default Quiz;