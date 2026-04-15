import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { fetchAllPosts, deletePost } from "../../utils/adminAPI";
import "../../styles/admin.css";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    postId: null,
    postTitle: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllPosts(pageNum, 10);
      setPosts(response.posts || []);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeleteClick = (postId, postTitle) => {
    setConfirmModal({
      isOpen: true,
      postId,
      postTitle,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(confirmModal.postId);
      setPosts(posts.filter((p) => p._id !== confirmModal.postId));
      setConfirmModal({ isOpen: false, postId: null, postTitle: null });
    } catch (err) {
      setError(err.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "16px" }}>Loading posts...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Posts Management</h1>
        <p>Manage and moderate all posts in the system</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>All Posts ({filteredPosts.length})</h2>
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <button onClick={() => fetchPosts()} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search filters"
                : "No posts in the system"}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title / Content</th>
                <th>Author</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <strong>{post.title || "Untitled"}</strong>
                    <br />
                    <small style={{ color: "#6B7280" }}>
                      {post.content?.substring(0, 60)}...
                    </small>
                  </td>
                  <td>{post.author?.name || "Unknown"}</td>
                  <td>❤️ {post.likes?.length || 0}</td>
                  <td>💬 {post.comments?.length || 0}</td>
                  <td>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDeleteClick(post._id, post.title || "Post")
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Post"
        message={`Are you sure you want to delete the post "${confirmModal.postTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, postId: null, postTitle: null })
        }
        isLoading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminPosts;
