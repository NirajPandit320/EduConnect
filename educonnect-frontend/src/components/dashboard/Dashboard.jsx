import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/userSlice";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
  });

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
        `http://localhost:5000/api/users/${user._id}`,
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
    </div>
  );
};

export default Dashboard;