import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";

const Leaderboard = () => {
  const { user } = useSelector((state) => state.user);

  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState("global");
  const [category, setCategory] = useState("overall");
  const [personalRank, setPersonalRank] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/leaderboard?period=${period}&category=${category}`
    );
    const data = await response.json();
    setEntries(Array.isArray(data) ? data : []);
  }, [period, category]);

  const fetchPersonalRank = useCallback(async () => {
    if (!user?.uid) return;

    const response = await fetch(`${API_BASE_URL}/api/leaderboard/${user.uid}`);
    const data = await response.json();

    if (response.ok) {
      setPersonalRank(data);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchPersonalRank();
  }, [fetchPersonalRank]);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>

        <div className="leaderboard-filters">
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="global">Global</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="overall">Overall</option>
            <option value="posts">Posts</option>
            <option value="events">Events</option>
            <option value="resources">Resources</option>
          </select>
        </div>
      </div>

      {personalRank ? (
        <div className="leaderboard-personal-card">
          <p>
            Your Rank: <strong>#{personalRank.rank}</strong> / {personalRank.totalUsers}
          </p>
          <p>
            Points: <strong>{personalRank.user?.points || 0}</strong>
          </p>
        </div>
      ) : null}

      <div className="leaderboard-list">
        {entries.map((entry) => (
          <div key={entry.uid} className="leaderboard-item">
            <div>
              <strong>#{entry.rank}</strong> {entry.name}
            </div>
            <div>
              <span>Score: {entry.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
