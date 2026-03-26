import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useSelector } from "react-redux";

const QuizHistory = () => {
  const { user } = useSelector((state) => state.user);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "quizResults"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => doc.data());
      setHistory(data);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="history-container">
      <h2>📜 Quiz History</h2>

      {history.map((h, i) => (
        <div key={i} className="history-card">
          <p>Score: {h.score}/{h.total}</p>
          <p>{new Date(h.createdAt.seconds * 1000).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default QuizHistory;