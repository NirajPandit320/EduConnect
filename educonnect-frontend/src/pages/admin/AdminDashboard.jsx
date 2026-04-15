import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAdminStats } from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    events: 0,
    jobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("[Dashboard] Fetching admin stats...");
      const response = await fetchAdminStats();
      console.log("[Dashboard] Stats received:", response);
      setStats(response.data || { users: 0, posts: 0, events: 0, jobs: 0 });
    } catch (err) {
      console.error("[Dashboard] Failed to fetch admin stats:", err);
      const errorMsg = err.message || "Failed to fetch statistics";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Welcome to the EduConnect Admin Panel</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-title">Total Users</div>
          <div className="stat-card-value">{stats.users || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-title">Total Posts</div>
          <div className="stat-card-value">{stats.posts || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-title">Total Events</div>
          <div className="stat-card-value">{stats.events || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💼</div>
          <div className="stat-card-title">Total Jobs</div>
          <div className="stat-card-value">{stats.jobs || 0}</div>
        </div>
      </div>

      <div style={{ marginTop: "32px", textAlign: "center" }}>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "⏳ Refreshing..." : "🔄 Refresh Stats"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
