import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#6C4DF6",
      color: "white",
      padding: "20px"
    }}>
      <h2>Admin</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/admin" style={link}>Dashboard</Link></li>
        <li><Link to="/admin/posts" style={link}>Posts</Link></li>
        <li><Link to="/admin/events" style={link}>Events</Link></li>
        <li><Link to="/admin/users" style={link}>Users</Link></li>
      </ul>
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