import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/admin/Modal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  fetchAllResources,
  uploadResource,
  deleteResource,
  updateResource,
} from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    resourceId: null,
    resourceTitle: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editModal, setEditModal] = useState({
    isOpen: false,
    resourceId: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "notes",
    files: null,
  });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllResources(1, 1000);
      setResources(response.resources || response?.data?.resources || []);
    } catch (err) {
      setError(err.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, files: e.target.files }));
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!formData.files || formData.files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setUploading(true);
    try {
      await uploadResource(formData);
      setShowUploadModal(false);
      setFormData({
        title: "",
        description: "",
        category: "notes",
        files: null,
      });
      await fetchResources();
    } catch (err) {
      setError(err.message || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (resource) => {
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      category: (resource.category || "notes").toLowerCase(),
      files: null,
    });
    setEditModal({ isOpen: true, resourceId: resource._id });
  };

  const handleSaveEdit = async () => {
    if (!editModal.resourceId) return;

    setEditing(true);
    try {
      await updateResource(editModal.resourceId, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });

      setEditModal({ isOpen: false, resourceId: null });
      setFormData({
        title: "",
        description: "",
        category: "notes",
        files: null,
      });
      await fetchResources();
    } catch (err) {
      setError(err.message || "Failed to update resource");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteClick = (resourceId, resourceTitle) => {
    setConfirmModal({
      isOpen: true,
      resourceId,
      resourceTitle,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteResource(confirmModal.resourceId);
      setResources(resources.filter((r) => r._id !== confirmModal.resourceId));
      setConfirmModal({ isOpen: false, resourceId: null, resourceTitle: null });
    } catch (err) {
      setError(err.message || "Failed to delete resource");
    } finally {
      setDeleting(false);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading resources...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Resources Management</h1>
        <p>Manage all educational resources and study materials</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>All Resources ({filteredResources.length})</h2>
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              ➕ Upload Resource
            </button>
            <button onClick={fetchResources} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No resources found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search filters"
                : "No resources uploaded in the system"}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Uploaded By</th>
                <th>Downloads</th>
                <th>Likes</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => (
                <tr key={resource._id}>
                  <td>
                    <strong>{resource.title || "Untitled"}</strong>
                    <br />
                    <small style={{ color: "#6B7280" }}>
                      {resource.description?.substring(0, 40)}...
                    </small>
                  </td>
                  <td>
                    <span
                      style={{
                        background: "#FEF3C7",
                        color: "#78350F",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {resource.category || "General"}
                    </span>
                  </td>
                  <td>{resource.uploaderName || resource.uploadedBy || "Unknown"}</td>
                  <td>📥 {resource.downloadCount || 0}</td>
                  <td>❤️ {resource.likeCount || 0}</td>
                  <td>
                    {resource.createdAt
                      ? new Date(resource.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditClick(resource)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteClick(resource._id, resource.title || "Resource")
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
        isOpen={showUploadModal}
        title="Upload New Resource"
        onClose={() => setShowUploadModal(false)}
        size="large"
        footer={
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUploadResource}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleUploadResource}>
          <div className="form-group">
            <label className="form-label">Resource Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter resource title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter resource description"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="notes">📝 Notes</option>
              <option value="docs">📖 Docs</option>
              <option value="video">🎥 Videos</option>
              <option value="ppt">📊 PPT</option>
              <option value="code">💻 Code</option>
              <option value="repository">📦 Repository</option>
              <option value="image">🖼️ Image</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Files</label>
            <input
              type="file"
              className="form-input"
              onChange={handleFileChange}
              multiple
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.jpg,.png"
            />
            <small style={{ color: "#6B7280", marginTop: "8px", display: "block" }}>
              Supported formats: PDF, DOC, XLS, PPT, ZIP, JPG, PNG, etc.
            </small>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Resource"
        message={`Are you sure you want to delete the resource "${confirmModal.resourceTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, resourceId: null, resourceTitle: null })
        }
        isLoading={deleting}
      />

      <Modal
        isOpen={editModal.isOpen}
        title="Edit Resource"
        onClose={() => setEditModal({ isOpen: false, resourceId: null })}
        footer={
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setEditModal({ isOpen: false, resourceId: null })}
              disabled={editing}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Resource Title</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="notes">📝 Notes</option>
            <option value="docs">📖 Docs</option>
            <option value="video">🎥 Videos</option>
            <option value="ppt">📊 PPT</option>
            <option value="code">💻 Code</option>
            <option value="repository">📦 Repository</option>
            <option value="image">🖼️ Image</option>
          </select>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminResources;