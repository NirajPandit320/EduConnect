import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import StatCard from "../../components/admin/StatCard";

const API = "http://localhost:5000";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    events: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: {
          email: "admin@educonnect.com"
        }
      });

      const data = await res.json();
      setStats(data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>

      <h1>Admin Dashboard</h1>

      <div style={{
        display: "flex",
        gap: "20px",
        marginTop: "20px"
      }}>
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Posts" value={stats.posts} />
        <StatCard title="Events" value={stats.events} />
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;