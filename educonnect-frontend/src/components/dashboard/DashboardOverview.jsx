import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ADDED: Firestore imports
import { db } from "../../utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

const DashboardOverview = () => {
  const { user } = useSelector((state) => state.user);

  const [stats, setStats] = useState(null);

  // FIXED: darkMode syntax error
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // ADDED: quiz score
  const [quizScore, setQuizScore] = useState(0);

  // DARK MODE
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // FETCH DASHBOARD STATS
  useEffect(() => {
    if (!user?.uid) return;

    fetch(`http://localhost:5000/api/dashboard/${user.uid}`)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, [user]);

  // ADDED: FETCH QUIZ SCORE FROM FIRESTORE
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "scores"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let total = 0;

      snap.docs.forEach((doc) => {
        total += doc.data().score;
      });

      setQuizScore(total);
    });

    return () => unsub();
  }, [user]);

  // CHART DATA
  const chartData = [
    { name: "Posts", value: stats?.totalPosts || 0 },
    { name: "Likes", value: stats?.totalLikes || 0 },
    { name: "Comments", value: stats?.totalComments || 0 },
  ];

  const profileCompletion = user?.branch && user?.year ? 100 : 60;

  // ANIMATED NUMBER
  const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value || 0;

      if (start === end) return;

      const duration = 800;
      const incrementTime = 20;
      const step = Math.ceil(end / (duration / incrementTime));

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setDisplay(start);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [value]);
    console.log("QUIZ SCORE:", quizScore);

    return <span>{display}</span>;
  };

  return (
    <div className={darkMode ? "overview dark" : "overview"}>

      {/* DARK MODE */}
      <div className="toggle-container">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* STATS */}
      <div className="stats-row">

        <div className="stat-card">
          <h3><AnimatedNumber value={stats?.totalPosts} /></h3>
          <p>Total Posts</p>
        </div>

        <div className="stat-card">
          <h3>{stats?.totalLikes || 0}</h3>
          <p>Total Likes</p>
        </div>

        <div className="stat-card">
          <h3>{stats?.totalComments || 0}</h3>
          <p>Total Comments</p>
        </div>

        {/* ADDED: QUIZ SCORE CARD */}
        <div className="stat-card">
          <h3>{quizScore}</h3>
          <p>Total Quiz Score</p>
        </div>

      </div>

      {/* CHART */}
      <div className="chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PROFILE */}
      <div className="profile-completion">
        <h3>Profile Completion</h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        <p>{profileCompletion}% Complete</p>
      </div>

      {/* ACTIVITY */}
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <ul>
          <li>Created a post</li>
          <li>Liked a post</li>
          <li>Updated profile</li>
        </ul>
      </div>

    </div>
  );
};

export default DashboardOverview;