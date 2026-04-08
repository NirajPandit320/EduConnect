import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
import { API_BASE_URL } from "../../utils/apiConfig";

const DashboardOverview = () => {
  const { user } = useSelector((state) => state.user);

  const [stats, setStats] = useState(null);

  // FIXED: darkMode syntax error
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // ADDED: quiz score
  const [quizScore, setQuizScore] = useState(0);

  // ADDED: Refresh trigger for real-time updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // ADDED: Function to fetch dashboard stats
  const fetchDashboardStats = useCallback(() => {
    if (!user?.uid) return;

    fetch(`${API_BASE_URL}/api/dashboard/${user.uid}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, [user]);

  // FETCH DASHBOARD STATS - Initial load and on user change
  useEffect(() => {
    fetchDashboardStats();
  }, [user, fetchDashboardStats]);

  // ADDED: Listen for stats-refresh events (triggered when posts are created)
  useEffect(() => {
    const handleRefresh = () => {
      fetchDashboardStats();
    };

    window.addEventListener("stats-refresh", handleRefresh);
    return () => window.removeEventListener("stats-refresh", handleRefresh);
  }, [fetchDashboardStats]);

  // ADDED: Periodic refresh every 15 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ADDED: Trigger fetch on refresh interval
  useEffect(() => {
    fetchDashboardStats();
  }, [refreshTrigger, fetchDashboardStats]);

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
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "2px solid #667eea",
                borderRadius: "8px",
                color: "#fff",
                padding: "10px",
              }}
              cursor={{ fill: "rgba(102, 126, 234, 0.1)" }}
              formatter={(value) => [value, "Count"]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="square"
            />
            <Bar
              dataKey="value"
              fill="#667eea"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              name="Metrics"
            />
          </BarChart>
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