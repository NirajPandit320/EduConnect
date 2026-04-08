import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/userSlice";
import { API_BASE_URL } from "../../utils/apiConfig";

//  Firestore imports
import { db } from "../../utils/firebase";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  //  SCORE STATE
  const [scores, setScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0); //  NEW

  const [formData, setFormData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
  });

  //  REAL-TIME FETCH (FIXED)
  useEffect(() => {
    const q = query(
      collection(db, "scores"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setScores(data);

      //  calculate total score
      const total = data.reduce((acc, item) => acc + (item.score || 0), 0);
      setTotalScore(total);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(setUser(data.user));
        setIsEditing(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">

      {/* 👤 PROFILE SECTION */}
      <h2 className="dashboard-title">
        Welcome back, <span>{user?.name || "User"}</span>
      </h2>

      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-row">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>

          <div className="profile-row">
            <label>Branch</label>
            <p>{user?.branch || "-"}</p>
          </div>

          <div className="profile-row">
            <label>Year</label>
            <p>{user?.year || "-"}</p>
          </div>

          <button
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="profile-edit">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />

          <input
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="Branch"
          />

          <input
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            placeholder="Year"
          />

          <div className="edit-actions">
            <button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/*  TOTAL SCORE (you can connect this to your top card) */}
      <div style={{ marginTop: "20px", fontWeight: "bold" }}>
        Total Quiz Score: {totalScore}
      </div>

      {/* 📊 QUIZ HISTORY SECTION */}
      <div className="history-card" style={{ marginTop: "30px" }}>
        <h2>📊 Quiz History</h2>

        {scores.length === 0 ? (
          <p>No attempts yet</p>
        ) : (
          scores.map((item) => (
            <div key={item.id} className="score-item">
              <p>
                Score: {item.score} / {item.totalQuestions}
              </p>
              <p>Percentage: {item.percentage}%</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;