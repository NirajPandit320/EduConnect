import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{
      width: "250px",
      height: "100vh",
      background: "#111827",
      color: "white",
      padding: "20px"
    }}>
      <h2 style={{ marginBottom: "20px" }}>Admin Panel</h2>

      <nav>
        <Link to="/admin" style={link}>Dashboard</Link>
        <Link to="/admin/users" style={link}>Users</Link>
        <Link to="/admin/posts" style={link}>Posts</Link>
        <Link to="/admin/events" style={link}>Events</Link>
        <Link to="/admin/quiz" style={link}>Quiz</Link>
        <Link to="/admin/placement" style={link}>Placement</Link>
        <Link to="/admin/notifications">Notifications</Link>
        <Link to="/admin/resources">Resources</Link>
        <Link to="/admin/settings">Settings</Link>
      </nav>
    </div>
  );
};

const link = {
  display: "block",
  color: "white",
  margin: "10px 0",
  textDecoration: "none",
};

export default Sidebar;