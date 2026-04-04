import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { saveScore } from "../../services/scoreService";

const Quiz = () => {
  const API =
    "https://opentdb.com/api.php?amount=10&category=18&type=multiple";

  const { user } = useSelector((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

 
  const [time, setTime] = useState(15);

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
      });
  }, []);

  // TIMER EFFECT
useEffect(() => {
  if (finished) return;

  const interval = setInterval(() => {
    setTime((prev) => {
      if (prev === 1) {
        handleNext();
        return 15;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [current, finished]);

  // SHUFFLE
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  // DECODE HTML
  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // NEXT QUESTION
  const handleNext = () => {
    let updatedScore = score;

    if (selected === questions[current]?.correct) {
      updatedScore = score + 1;
      setScore(updatedScore);
    }

    setSelected("");
    setTime(15);

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);

      const total = questions.length;

      if (total > 0 && user?.uid) {
        // ✅ FIXED: pass uid
        saveScore(updatedScore, total, user.uid);
      }
    }
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

  return (
    <div className="quiz-container quiz-active">
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">Question {current + 1} / {questions.length}</span>
        </div>
        <div className={`timer ${time <= 5 ? "timer-warning" : ""}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{time}s</span>
        </div>
      </div>

      <div className="quiz-body">
        <h2 className="question-text">{q.question}</h2>

        <div className="options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${selected === opt ? "selected" : ""}`}
              onClick={() => setSelected(opt)}
            >
              <span className="option-label">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button
          onClick={handleNext}
          className="next-btn"
          disabled={!selected}
        >
          {current + 1 === questions.length ? "Finish" : "Next"} →
        </button>
      </div>
    </div>
  );
};

export default Quiz;