import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostComposer from "./PostComposer";
import { API_BASE_URL } from "../../utils/apiConfig";
const API = process.env.REACT_APP_API_URL;

const PostsList = () => {

  const { user } = useSelector((state) => state.user);

  const [posts, setPosts] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  const fetchPosts = async () => {
    const res = await fetch(`${API_BASE_URL}/api/posts`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: "DELETE",
    });

    setPosts(posts.filter((p) => p._id !== id));
  };

  const toggleLike = async (id) => {
    await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    });

    fetchPosts();
  };

  const addComment = async (id) => {
    if (!commentText[id]) return;

    await fetch(`${API_BASE_URL}/api/posts/${id}/comment`, {
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
    const res = await fetch(`${API_BASE_URL}/api/posts/${id}/edit`, {
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

      {posts.length === 0 ? (
        <div className="empty-posts">
          <div className="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        <div className="posts-feed">
          {posts.map((post) => (

            <div key={post._id} className="post-card">

              {/* POST HEADER */}
              <div className="post-header">
                <div className="post-user">
                  <div className="post-avatar">
                    {post.userName?.charAt(0) || "U"}
                  </div>
                  <div className="post-user-info">
                    <h4 className="post-author">{post.userName || "User"}</h4>
                    <span className="post-time">Just now</span>
                  </div>
                </div>

                {post.uid === user.uid && (
                  <div className="post-menu">
                    <button
                      className="post-icon-btn edit"
                      onClick={() => startEdit(post)}
                      title="Edit post"
                    >
                      ✏️
                    </button>
                    <button
                      className="post-icon-btn delete"
                      onClick={() => deletePost(post._id)}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* POST CONTENT */}
              {editingPostId === post._id ? (
                <div className="edit-mode">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button onClick={() => updatePost(post._id)} className="save-btn">
                      ✅ Save
                    </button>
                    <button onClick={() => setEditingPostId(null)} className="cancel-btn">
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="post-content">{post.content}</p>
              )}

              {/* POST IMAGES */}
              {post.images?.length > 0 && (
                <div className="post-images-container">
                  <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                    {post.images.map((img, i) => (
                      <img
                        key={i}
                        src={`${API}/uploads/${img}`}
                        alt="post"
                        className="post-image"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* POST ACTIONS */}
              <div className="post-actions-container">
                <div className="post-stats">
                  <span className="stat">
                    <strong>{post.likes?.length || 0}</strong> likes
                  </span>
                  <span className="stat">
                    <strong>{post.comments?.length || 0}</strong> comments
                  </span>
                </div>

                <div className="post-actions">
                  <button
                    className={`action-btn ${post.likes?.includes(user.uid) ? 'liked' : ''}`}
                    onClick={() => toggleLike(post._id)}
                  >
                    <span className="action-icon">❤️</span>
                    <span className="action-label">Like</span>
                  </button>

                  <button
                    className={`action-btn ${showComments[post._id] ? 'active' : ''}`}
                    onClick={() => toggleComments(post._id)}
                  >
                    <span className="action-icon">💬</span>
                    <span className="action-label">Comment</span>
                  </button>
                </div>
              </div>

              {/* COMMENTS SECTION */}
              {showComments[post._id] && (
                <div className="comment-section">
                  <div className="comments-divider"></div>

                  <div className="comments-list">
                    {post.comments?.length === 0 ? (
                      <p className="no-comments">No comments yet. Be the first!</p>
                    ) : (
                      post.comments?.map((c, i) => (
                        <div key={i} className="comment">
                          <div className="comment-avatar">
                            {c.name?.charAt(0) || "U"}
                          </div>
                          <div className="comment-content">
                            <p className="comment-name">{c.name || "User"}</p>
                            <p className="comment-text">{c.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="comment-input">
                    <input
                      placeholder="Write a comment..."
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText({
                          ...commentText,
                          [post._id]: e.target.value,
                        })
                      }
                      className="comment-field"
                    />

                    <button
                      onClick={() => addComment(post._id)}
                      className="comment-submit"
                      disabled={!commentText[post._id]?.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsList;