import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

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
  
  const data = [
  { name: "Users", value: stats.users },
  { name: "Posts", value: stats.posts },
  { name: "Events", value: stats.events },
];

<BarChart width={400} height={300} data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" />
</BarChart>

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