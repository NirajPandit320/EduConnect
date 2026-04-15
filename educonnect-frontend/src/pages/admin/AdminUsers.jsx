import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { fetchAllUsers, deleteUser } from "../../utils/adminAPI";
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
  });
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(confirmModal.userId);
      setUsers(users.filter((u) => u._id !== confirmModal.userId));
      setConfirmModal({ isOpen: false, userId: null, userName: null });
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
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
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.role || "User"}</td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(user._id, user.name)}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmModal.userName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, userId: null, userName: null })
        }
        isLoading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
