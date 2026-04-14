import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://localhost:5000";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await fetch(`${API}/api/admin/posts`, {
      headers: { email: "admin@educonnect.com" }
    });
    const data = await res.json();
    setPosts(data);
  };

  const deletePost = async (id) => {
    await fetch(`${API}/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: { email: "admin@educonnect.com" }
    });

    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <AdminLayout>
      <h2>Posts</h2>

      {posts.map(post => (
        <div key={post._id}>
          {post.content}
          <button onClick={() => deletePost(post._id)}>Delete</button>
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminPosts;