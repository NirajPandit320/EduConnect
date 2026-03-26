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

  // ✅ TIMER STATE
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

  // ✅ TIMER EFFECT
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
  if (questions.length === 0) return <h2>Loading Quiz...</h2>;

  // RESULT SCREEN
  if (finished) {
    return (
      <div className="quiz-container">
        <h2>🎉 Quiz Finished</h2>
        <h3>
          Score: {score} / {questions.length}
        </h3>

        <button onClick={restartQuiz}>Restart</button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="quiz-container">

      {/* ✅ TIMER UI */}
      <h4>⏱ {time}s</h4>

      <h3>
        Question {current + 1} / {questions.length}
      </h3>

      <h2>{q.question}</h2>

      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option ${selected === opt ? "selected" : ""}`}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button onClick={handleNext} className="next-btn">
        Next
      </button>

    </div>
  );
};

export default Quiz;