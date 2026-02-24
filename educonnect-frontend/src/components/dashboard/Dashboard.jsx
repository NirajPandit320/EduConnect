import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/userSlice";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);

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
        alert("Profile updated successfully");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.name}</h2>

      {!isEditing ? (
        <>
          <p>Email: {user?.email}</p>
          <p>Branch: {user?.branch}</p>
          <p>Year: {user?.year}</p>

          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </>
      ) : (
        <>
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

          <button onClick={handleUpdate}>
            Save Changes
          </button>

          <button onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;