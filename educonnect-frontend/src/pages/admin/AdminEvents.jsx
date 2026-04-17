import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Modal from "../../components/admin/Modal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  fetchAllEvents,
  createEvent,
  deleteEvent,
  updateEventStatus,
} from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllEvents(1, 1000, "all");
      setEvents(response.events || []);
    } catch (err) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const eventData = {
        ...formData,
        eventDate: `${formData.date}T${formData.time}`,
      };

      await createEvent(eventData);
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        maxAttendees: "",
      });
      await fetchEvents();
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (eventId, eventTitle) => {
    setConfirmModal({
      isOpen: true,
      eventId,
      eventTitle,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(confirmModal.eventId);
      setEvents(events.filter((e) => e._id !== confirmModal.eventId));
      setConfirmModal({ isOpen: false, eventId: null, eventTitle: null });
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (eventId, status) => {
    setStatusUpdatingId(eventId);
    try {
      const response = await updateEventStatus(eventId, status);
      const updatedEvent = response?.event || response?.data?.event;

      if (updatedEvent?._id) {
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
        );
      } else {
        await fetchEvents();
      }
    } catch (err) {
      setError(err.message || "Failed to update event status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusMeta = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "active") {
      return { label: "Approved", background: "#ECFDF5", color: "#065F46" };
    }

    if (normalized === "cancelled") {
      return { label: "Rejected", background: "#FEF2F2", color: "#991B1B" };
    }

    if (normalized === "completed") {
      return { label: "Completed", background: "#EEF2FF", color: "#3730A3" };
    }

    return { label: "Pending", background: "#FFFBEB", color: "#92400E" };
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading events...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Events Management</h1>
        <p>Manage all events and handle event requests</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>All Events ({filteredEvents.length})</h2>
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              ➕ Create Event
            </button>
            <button onClick={fetchEvents} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No events found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search filters"
                : "No events in the system"}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Date</th>
                <th>Attendees</th>
                <th>Max Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const statusMeta = getStatusMeta(event.eventStatus);
                const isUpdating = statusUpdatingId === event._id;
                const canApprove = String(event.eventStatus || "").toLowerCase() !== "active";
                const canReject = String(event.eventStatus || "").toLowerCase() !== "cancelled";

                return (
                <tr key={event._id}>
                  <td>
                    <strong>{event.title || "Untitled"}</strong>
                  </td>
                  <td>{event.location || "N/A"}</td>
                  <td>
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{event.participants?.length || 0}</td>
                  <td>{event.capacity || "Unlimited"}</td>
                  <td>
                    <span
                      style={{
                        background: statusMeta.background,
                        color: statusMeta.color,
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusUpdate(event._id, "active")}
                      disabled={!canApprove || isUpdating}
                    >
                      {isUpdating && canApprove ? "..." : "Accept"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusUpdate(event._id, "cancelled")}
                      disabled={!canReject || isUpdating}
                    >
                      {isUpdating && canReject ? "..." : "Reject"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteClick(event._id, event.title || "Event")
                      }
                      disabled={isUpdating}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        title="Create New Event"
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
              onClick={handleCreateEvent}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                name="time"
                className="form-input"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
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
              <label className="form-label">Max Attendees</label>
              <input
                type="number"
                name="maxAttendees"
                className="form-input"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${confirmModal.eventTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, eventId: null, eventTitle: null })
        }
        isLoading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminEvents;
