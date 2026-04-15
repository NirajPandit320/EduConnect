import { useState } from "react";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/admin/Modal";
import { createNotification } from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminNotifications = () => {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      // For broadcasting, we need to send to all users
      // This would typically require a batch notification API
      const notificationData = {
        ...formData,
        broadcast: true, // Flag indicating this is a broadcast
      };

      await createNotification(notificationData);

      setSuccessMessage("✓ Notification broadcast sent successfully!");
      setFormData({
        title: "",
        message: "",
        type: "info",
      });
      setShowBroadcastModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Notifications & Announcements</h1>
        <p>Send broadcasts and manage notifications</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Send Broadcast Notification</h2>
        </div>

        <div style={{ padding: "40px", textAlign: "center" }}>
          <div className="empty-state-icon" style={{ marginBottom: "20px" }}>
            📢
          </div>
          <h3 style={{ marginBottom: "16px" }}>Send Notification to All Users</h3>
          <p style={{ color: "#6B7280", marginBottom: "24px" }}>
            Create and broadcast important announcements and notifications to all registered users in the system.
          </p>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn btn-primary"
            style={{ fontSize: "16px", padding: "12px 24px" }}
          >
            ➕ Create & Send Notification
          </button>
        </div>
      </div>

      {/* Recent Notifications Preview */}
      <div className="table-container" style={{ marginTop: "32px" }}>
        <div className="table-header">
          <h2>Notification Types</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            padding: "24px",
          }}
        >
          <div className="stat-card">
            <div className="stat-card-icon">ℹ️</div>
            <div className="stat-card-title">Info</div>
            <p style={{ color: "#6B7280", fontSize: "12px" }}>
              General informational messages and updates
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">⚠️</div>
            <div className="stat-card-title">Warning</div>
            <p style={{ color: "#6B7280", fontSize: "12px" }}>
              Important warnings and alerts for users
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">✓</div>
            <div className="stat-card-title">Success</div>
            <p style={{ color: "#6B7280", fontSize: "12px" }}>
              Positive updates and success announcements
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">❌</div>
            <div className="stat-card-title">Error</div>
            <p style={{ color: "#6B7280", fontSize: "12px" }}>
              Critical errors and urgent notifications
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={showBroadcastModal}
        title="Broadcast Notification to All Users"
        onClose={() => setShowBroadcastModal(false)}
        size="large"
        footer={
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowBroadcastModal(false)}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSendNotification}
              disabled={sending}
            >
              {sending ? "Sending..." : "📤 Send to All Users"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSendNotification}>
          <div className="form-group">
            <label className="form-label">Notification Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., System Maintenance Notice"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              className="form-textarea"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Enter your notification message here. Be clear and concise."
              style={{ minHeight: "150px" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notification Type</label>
            <select
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✓ Success</option>
              <option value="error">❌ Error</option>
            </select>
          </div>

          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FCD34D",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#78350F",
            }}
          >
            📌 This notification will be sent to <strong>all active users</strong> in the system. Ensure the message is appropriate and necessary.
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminNotifications;