import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostComposer from "./PostComposer";

const PostsList = () => {

  const { user } = useSelector((state) => state.user);

  const API = "http://localhost:5000";

  const [posts, setPosts] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  const fetchPosts = async () => {
    const res = await fetch(`${API}/api/posts`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    await fetch(`${API}/api/posts/${id}`, {
      method: "DELETE",
    });

    setPosts(posts.filter((p) => p._id !== id));
  };

  const toggleLike = async (id) => {
    await fetch(`${API}/api/posts/${id}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    });

    fetchPosts();
  };

  const addComment = async (id) => {
    if (!commentText[id]) return;

    await fetch(`${API}/api/posts/${id}/comment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        text: commentText[id],
      }),
    });

    setCommentText({ ...commentText, [id]: "" });

    fetchPosts();
  };

  const toggleComments = (id) => {
    setShowComments({
      ...showComments,
      [id]: !showComments[id],
    });
  };

  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditText(post.content);
  };

  const updatePost = async (id) => {
    const res = await fetch(`${API}/api/posts/${id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText }),
    });

    const data = await res.json();

    setPosts((prev) =>
      prev.map((p) => (p._id === id ? data.post : p))
    );

    setEditingPostId(null);
  };

  return (
    <div className="posts-container">

      <PostComposer onPostCreated={fetchPosts} />

      {posts.map((post) => (

        <div key={post._id} className="post-card">

          <div className="post-header">
            <div className="avatar">
              {post.userName?.charAt(0) || "U"}
            </div>

            <div>
              <h4>{post.userName || "User"}</h4>
              <span className="post-time">Just now</span>
            </div>
          </div>

          {editingPostId === post._id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />

              <button onClick={() => updatePost(post._id)}>Save</button>
              <button onClick={() => setEditingPostId(null)}>Cancel</button>
            </>
          ) : (
            <p className="post-content">{post.content}</p>
          )}

          {post.images?.length > 0 && (
            <div className="post-images">
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={`${API}/uploads/${img}`}
                  alt="post"
                />
              ))}
            </div>
          )}

          <div className="post-actions">

            <button onClick={() => toggleLike(post._id)}>
              ❤️ {post.likes?.length || 0}
            </button>

            <button onClick={() => toggleComments(post._id)}>
              💬 {post.comments?.length || 0}
            </button>

            {post.uid === user.uid && (
              <>
                <button onClick={() => startEdit(post)}>✏️</button>
                <button onClick={() => deletePost(post._id)}>🗑</button>
              </>
            )}

          </div>

          {showComments[post._id] && (
            <div className="comment-section">

              {post.comments?.map((c, i) => (
                <div key={i} className="comment">{c.text}</div>
              ))}

              <div className="comment-input">

                <input
                  placeholder="Write comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post._id]: e.target.value,
                    })
                  }
                />

                <button onClick={() => addComment(post._id)}>
                  Send
                </button>

              </div>

            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default PostsList;