import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminEmail");
    navigate("/");
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

      <button onClick={handleAdminLogout} style={logoutBtn}>
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

const logoutBtn = {
  background: "rgba(255,59,48,0.3)",
  border: "1px solid rgba(255,59,48,0.5)",
  color: "white",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "auto"
};

export default Sidebar;