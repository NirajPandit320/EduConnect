import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/quiz`)
      .then(res => res.json())
      .then(setQuizzes);
  }, []);

  return (
    <AdminLayout>
      <h2>Quiz</h2>

      {quizzes.map(q => (
        <div key={q._id}>{q.title}</div>
      ))}
    </AdminLayout>
  );
};

export default AdminQuiz;