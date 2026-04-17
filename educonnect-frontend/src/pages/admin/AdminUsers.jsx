import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { fetchAllUsers, setUserBlockStatus } from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    userName: null,
    nextBlockedState: false,
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockToggleClick = (userId, userName, isCurrentlyBlocked) => {
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
      nextBlockedState: !isCurrentlyBlocked,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      const response = await setUserBlockStatus(
        confirmModal.userId,
        confirmModal.nextBlockedState
      );
      const updatedUser = response?.user;

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === confirmModal.userId ? { ...u, ...updatedUser } : u
        )
      );
      setConfirmModal({
        isOpen: false,
        userId: null,
        userName: null,
        nextBlockedState: false,
      });
    } catch (err) {
      setError(err.message || "Failed to update user status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Users Management</h1>
        <p>Manage all registered users in the system</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>All Users ({filteredUsers.length})</h2>
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <button onClick={fetchUsers} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search filters"
                : "No users registered in the system"}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isBlocked = user.status === "blocked" || user.status === "inactive";

                return (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>{user.role || "User"}</span>
                      {isBlocked ? (
                        <span style={{ color: "#DC2626", fontSize: "12px" }}>Blocked</span>
                      ) : (
                        <span style={{ color: "#16A34A", fontSize: "12px" }}>Active</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${isBlocked ? "btn-secondary" : "btn-danger"}`}
                      onClick={() => handleBlockToggleClick(user._id, user.name, isBlocked)}
                    >
                      {isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.nextBlockedState ? "Block User" : "Unblock User"}
        message={
          confirmModal.nextBlockedState
            ? `Are you sure you want to block "${confirmModal.userName}"? Blocked users cannot log in until unblocked.`
            : `Are you sure you want to unblock "${confirmModal.userName}"?`
        }
        confirmLabel={confirmModal.nextBlockedState ? "Block" : "Unblock"}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            userId: null,
            userName: null,
            nextBlockedState: false,
          })
        }
        isLoading={updatingStatus}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
