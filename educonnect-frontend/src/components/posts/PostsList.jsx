import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const PostsList = () => {
  const { user } = useSelector((state) => state.user);

  const API = "http://localhost:5000";

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchPosts = async () => {
    const res = await fetch(`${API}/api/posts`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // IMAGE SELECT
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // CREATE POST
  const createPost = async () => {
    if (!newPost && images.length === 0) return;

    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("content", newPost);

    images.forEach((img) => {
      formData.append("images", img);
    });

    await fetch(`${API}/api/posts`, {
      method: "POST",
      body: formData,
    });

    setNewPost("");
    setImages([]);
    setPreviewImages([]);

    fetchPosts();
  };

  // DELETE POST
  const deletePost = async (id) => {
    await fetch(`${API}/api/posts/${id}`, {
      method: "DELETE",
    });

    setPosts(posts.filter((p) => p._id !== id));
  };

  // START EDIT
  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditText(post.content);
  };

  // UPDATE POST
  const updatePost = async (id) => {
    try {
      const res = await fetch(`${API}/api/posts/${id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Edit failed:", data);
        return;
      }

      // update UI with returned post
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? data.post : p))
      );

      setEditingPostId(null);
      setEditText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="posts-container">

      <h2>Create Post</h2>

      <textarea
        placeholder="Write something..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* PREVIEW */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        {previewImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="preview"
            width="120"
            style={{ borderRadius: "8px" }}
          />
        ))}
      </div>

      <button onClick={createPost}>Post</button>

      <hr />

      {posts.map((post) => (
        <div key={post._id} className="post-card">

          <h3>{post.userName}</h3>

          {/* EDIT MODE */}
          {editingPostId === post._id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />

              <button onClick={() => updatePost(post._id)}>
                Save
              </button>

              <button onClick={() => setEditingPostId(null)}>
                Cancel
              </button>
            </>
          ) : (
            <p>{post.content}</p>
          )}

          {/* MULTIPLE IMAGES */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {post.images &&
              post.images.map((img, i) => (
                <img
                  key={i}
                  src={`${API}/uploads/${img}`}
                  alt="post"
                  width="200"
                  style={{ borderRadius: "10px" }}
                />
              ))}
          </div>

          {/* BUTTONS */}
          {post.uid === user.uid && (
            <div style={{ marginTop: "10px" }}>

              <button onClick={() => startEdit(post)}>
                Edit
              </button>

              <button
                onClick={() => deletePost(post._id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>

            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsList;