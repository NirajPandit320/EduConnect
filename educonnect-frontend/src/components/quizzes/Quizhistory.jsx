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
    if (!user?.uid) {
      setHistory([]);
      return undefined;
    }

    const q = query(
      collection(db, "scores"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aMs = a?.createdAt?.toMillis?.() || 0;
          const bMs = b?.createdAt?.toMillis?.() || 0;
          return bMs - aMs;
        });

      setHistory(data);
    });

    return () => unsub();
  }, [user?.uid]);

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "Date unavailable";

    const millis =
      typeof createdAt?.toMillis === "function"
        ? createdAt.toMillis()
        : createdAt?.seconds
          ? createdAt.seconds * 1000
          : null;

    if (!millis) return "Date unavailable";
    return new Date(millis).toLocaleString();
  };

  return (
    <div className="history-container">
      <h2>📜 Quiz History</h2>

      {history.map((h) => (
        <div key={h.id} className="history-card">
          <p>Score: {h.score}/{h.totalQuestions ?? h.total}</p>
          <p>{formatCreatedAt(h.createdAt)}</p>
        </div>
      ))}
    </div>
  );
};

export default QuizHistory;