import { Link, useNavigate } from "react-router-dom";
import { clearAdminSession } from "../../utils/adminHelper";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/auth");
  };

  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#6C4DF6",
      color: "white",
      padding: "20px",
      display: "flex",
      flexDirection: "column"
    }}>
      <h2>Admin</h2>

      <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
        <li><Link to="/admin" style={link}>Dashboard</Link></li>
        <li><Link to="/admin/posts" style={link}>Posts</Link></li>
        <li><Link to="/admin/events" style={link}>Events</Link></li>
        <li><Link to="/admin/users" style={link}>Users</Link></li>
      </ul>

      <button
        onClick={handleLogout}
        style={{
          background: "#fff",
          color: "#6C4DF6",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "auto"
        }}
      >
        Logout
      </button>
    </div>
  );
};

const link = {
  color: "white",
  textDecoration: "none",
  display: "block",
  margin: "10px 0"
};

export default Sidebar;