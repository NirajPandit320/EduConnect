import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminPlacement = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/placement`)
      .then(res => res.json())
      .then(setJobs);
  }, []);

  return (
    <AdminLayout>
      <h2>Placements</h2>

      {jobs.map(job => (
        <div key={job._id}>
          {job.company} - {job.role}
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminPlacement;