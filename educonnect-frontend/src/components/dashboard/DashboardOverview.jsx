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

    return <span>{display}</span>;
  };

  return (
    <div className={darkMode ? "overview dark" : "overview"}>

      {/* DARK MODE */}
      <div className="toggle-container">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          <span className="toggle-icon">{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="hero-card">
        <h1>Welcome back, <span>{user?.name || "User"}</span>!</h1>
        <p className="hero-date">Here's your performance overview</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card stat-posts">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3><AnimatedNumber value={stats?.totalPosts} /></h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card stat-likes">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3><AnimatedNumber value={stats?.totalLikes} /></h3>
            <p>Total Likes</p>
          </div>
        </div>

        <div className="stat-card stat-comments">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3><AnimatedNumber value={stats?.totalComments} /></h3>
            <p>Total Comments</p>
          </div>
        </div>

        <div className="stat-card stat-quiz">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3><AnimatedNumber value={quizScore} /></h3>
            <p>Quiz Score</p>
          </div>
        </div>

      </div>

      {/* CHART */}
      <div className="chart-card">
        <h3 className="chart-title">📊 Activity Overview</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff"
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: "#667eea", r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PROFILE COMPLETION */}
      <div className="profile-completion">
        <div className="profile-header">
          <h3>📌 Profile Completion</h3>
          <span className="completion-percentage">{profileCompletion}%</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        <p className="completion-text">
          {profileCompletion === 100
            ? "✅ Profile is complete!"
            : "📝 Add your branch and year to complete your profile"}
        </p>
      </div>

      {/* ACTIVITY */}
      <div className="activity-section">
        <h3>⚡ Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-dot"></span>
            <span className="activity-text">Created a post</span>
          </div>
          <div className="activity-item">
            <span className="activity-dot"></span>
            <span className="activity-text">Liked a post</span>
          </div>
          <div className="activity-item">
            <span className="activity-dot"></span>
            <span className="activity-text">Updated profile</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardOverview;