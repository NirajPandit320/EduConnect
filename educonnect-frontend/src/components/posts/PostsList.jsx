import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PostComposer from "./PostComposer";
import ProgressBar from "../common/ProgressBar";
import SkeletonCard from "../common/SkeletonCard";
import { API_BASE_URL } from "../../utils/apiConfig";

const PostsList = () => {

  const { user } = useSelector((state) => state.user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [hiddenPostIds, setHiddenPostIds] = useState([]);
  const [undoPostId, setUndoPostId] = useState("");
  const hideTimeoutsRef = useRef({});

  const formatPostTimestamp = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hrs ago`;

    const datePart = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timePart = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart}, ${timePart}`;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/posts`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Extract posts array from response structure: { success, message, data: { posts, pagination } }
      const postsList = data?.data?.posts || [];

      if (!Array.isArray(postsList)) {
        console.warn("Posts response is not an array:", postsList);
        setPosts([]);
      } else {
        setPosts(postsList);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err.message || "Failed to load posts");
      setPosts([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timeoutsToClean = hideTimeoutsRef.current;
      Object.values(timeoutsToClean).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const deletePost = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete post: ${res.statusText}`);
      }

      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Failed to delete post");
    }
  };

  const toggleLike = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.uid }),
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle like: ${res.statusText}`);
      }

      fetchPosts();
    } catch (err) {
      console.error("Toggle like error:", err);
      alert("Failed to like post");
    }
  };

  const addComment = async (id) => {
    try {
      if (!commentText[id]?.trim()) return;

      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/comment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          text: commentText[id],
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add comment: ${res.statusText}`);
      }

      setCommentText({ ...commentText, [id]: "" });
      fetchPosts();
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Failed to add comment");
    }
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
    try {
      if (!editText?.trim()) {
        alert("Post content cannot be empty");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editText,
          uid: user?.uid
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update post: ${res.statusText}`);
      }

      const data = await res.json();

      // Backend returns { success, message, data: post }
      const updatedPost = data?.data;

      setPosts((prev) =>
        prev.map((p) => (p._id === id ? updatedPost : p))
      );

      setEditingPostId(null);
    } catch (err) {
      console.error("Update post error:", err);
      alert("Failed to update post");
    }
  };

  const hidePost = (postId) => {
    setHiddenPostIds((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
    setUndoPostId(postId);

    if (hideTimeoutsRef.current[postId]) {
      clearTimeout(hideTimeoutsRef.current[postId]);
    }

    hideTimeoutsRef.current[postId] = setTimeout(() => {
      setUndoPostId((currentUndo) => (currentUndo === postId ? "" : currentUndo));
      delete hideTimeoutsRef.current[postId];
    }, 5000);
  };

  const undoHidePost = () => {
    if (!undoPostId) return;

    const postId = undoPostId;

    if (hideTimeoutsRef.current[postId]) {
      clearTimeout(hideTimeoutsRef.current[postId]);
      delete hideTimeoutsRef.current[postId];
    }

    setHiddenPostIds((prev) => prev.filter((id) => id !== postId));
    setUndoPostId("");
  };

  return (
    <div className="posts-container">
      {/* Progress Bar for initial load */}
      <ProgressBar visible={loading} duration={2000} />

      <PostComposer onPostCreated={fetchPosts} />

      {/* Loading State - Skeleton Cards */}
      {loading && (
        <div className="posts-feed">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={`skeleton-${i}`} type="post" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="posts-error">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load posts</h3>
          <p>{error}</p>
          <button onClick={fetchPosts} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 ? (
        <div className="empty-posts">
          <div className="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      ) : null}

      {/* Posts Feed - Success State */}
      {!loading && !error && posts.length > 0 && (
        <div className="posts-feed">
          {posts.filter((post) => !hiddenPostIds.includes(post?._id)).map((post) => {
            // Defensive checks - ensure post data exists
            if (!post?._id) return null;

            return (
              <div key={post._id} className="post-card">

                {/* POST HEADER */}
                <div className="post-header">
                  <div className="post-user">
                    <div className="post-avatar">
                      {post?.userName?.charAt(0) || "U"}
                    </div>
                    <div className="post-user-info">
                      <h4 className="post-author">{post?.userName || "User"}</h4>
                      <span className="post-time">{formatPostTimestamp(post?.createdAt)}</span>
                    </div>
                  </div>

                  <div className="post-menu">
                    <button
                      className="post-icon-btn hide"
                      onClick={() => hidePost(post._id)}
                      title="Hide post"
                    >
                      🙈
                    </button>

                    {post?.uid === user?.uid && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* POST CONTENT */}
                {editingPostId === post._id ? (
                  <div className="edit-mode">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-textarea"
                      placeholder="Edit your post..."
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
                  <p className="post-content">{post?.content || ""}</p>
                )}

                {/* POST IMAGES */}
                {post?.images?.length > 0 && (
                  <div className="post-images-container">
                    <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                      {post.images.map((img, i) => (
                        <img
                          key={i}
                          src={`${API_BASE_URL}/uploads/${img}`}
                          alt="post"
                          className="post-image"
                          onError={(e) => {
                            console.warn("Image failed to load:", img);
                            e.target.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* POST ACTIONS */}
                <div className="post-actions-container">
                  <div className="post-stats">
                    <span className="stat">
                      <strong>{post?.likes?.length || 0}</strong> likes
                    </span>
                    <span className="stat">
                      <strong>{post?.comments?.length || 0}</strong> comments
                    </span>
                  </div>

                  <div className="post-actions">
                    <button
                      className={`action-btn ${post?.likes?.includes(user?.uid) ? 'liked' : ''}`}
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
                      {post?.comments?.length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first!</p>
                      ) : (
                        post?.comments?.map((c, i) => (
                          <div key={i} className="comment">
                            <div className="comment-avatar">
                              {c?.name?.charAt(0) || "U"}
                            </div>
                            <div className="comment-content">
                              <p className="comment-name">{c?.name || "User"}</p>
                              <p className="comment-text">{c?.text || ""}</p>
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
            );
          })}
        </div>
      )}

      {undoPostId ? (
        <div className="undo-toast">
          <span>Post hidden</span>
          <button type="button" onClick={undoHidePost}>Undo</button>
        </div>
      ) : null}
    </div>
  );
};

export default PostsList;