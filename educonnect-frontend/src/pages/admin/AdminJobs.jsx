import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/admin/Modal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { fetchAllJobs, createJob, deleteJob } from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    salary: "",
    location: "",
    jobType: "Full-time",
  });

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllJobs(1, 20);
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createJob(formData);
      setShowCreateModal(false);
      setFormData({
        title: "",
        company: "",
        description: "",
        salary: "",
        location: "",
        jobType: "Full-time",
      });
      await fetchJobs();
    } catch (err) {
      setError(err.message || "Failed to create job");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (jobId, jobTitle) => {
    setConfirmModal({
      isOpen: true,
      jobId,
      jobTitle,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteJob(confirmModal.jobId);
      setJobs(jobs.filter((j) => j._id !== confirmModal.jobId));
      setConfirmModal({ isOpen: false, jobId: null, jobTitle: null });
    } catch (err) {
      setError(err.message || "Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading jobs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Jobs & Placements</h1>
        <p>Manage all job postings and placements</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>All Jobs ({filteredJobs.length})</h2>
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              ➕ Post Job
            </button>
            <button onClick={fetchJobs} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>No jobs found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search filters"
                : "No jobs posted in the system"}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <strong>{job.title || "Untitled"}</strong>
                  </td>
                  <td>{job.company || "N/A"}</td>
                  <td>{job.location || "N/A"}</td>
                  <td>
                    <span
                      style={{
                        background: "#EFF6FF",
                        color: "#0C2340",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {job.jobType || "Full-time"}
                    </span>
                  </td>
                  <td>{job.salary ? `₹${job.salary}` : "N/A"}</td>
                  <td>
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteClick(job._id, job.title || "Job")
                      }
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        title="Post New Job"
        onClose={() => setShowCreateModal(false)}
        size="large"
        footer={
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateJob}
              disabled={creating}
            >
              {creating ? "Posting..." : "Post Job"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateJob}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter job title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              type="text"
              name="company"
              className="form-input"
              value={formData.company}
              onChange={handleInputChange}
              required
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter job description"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="Enter location"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select
                name="jobType"
                className="form-select"
                value={formData.jobType}
                onChange={handleInputChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Salary (Optional)</label>
            <input
              type="text"
              name="salary"
              className="form-input"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Enter salary range (e.g., 5,00,000 - 10,00,000)"
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Job"
        message={`Are you sure you want to delete the job posting "${confirmModal.jobTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, jobId: null, jobTitle: null })
        }
        isLoading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminJobs;