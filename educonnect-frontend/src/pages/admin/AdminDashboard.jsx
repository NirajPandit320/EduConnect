import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import StatCard from "../../components/admin/StatCard";
import { fetchAdminStats } from "../../utils/adminHelper";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);

    try {
      const response = await fetchAdminStats();
      console.log("Admin stats response:", response);
      setStats(response.data || { users: 0, posts: 0, events: 0 });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      if (error.message.includes("log in again")) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <button onClick={fetchStats} disabled={loading} style={{ marginTop: "12px" }}>
        {loading ? "Fetching Stats..." : "Fetch Stats"}
      </button>

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
