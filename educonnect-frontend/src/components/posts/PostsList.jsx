import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PostComposer from "./PostComposer";
import ProgressBar from "../common/ProgressBar";
import SkeletonCard from "../common/SkeletonCard";
import { API_BASE_URL } from "../../utils/apiConfig";
import PostActionIcon from "./PostActionIcon";
import { getMediaUrl } from "../../utils/media";

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
  const [pendingLikeIds, setPendingLikeIds] = useState({});
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
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const timeoutsToClean = hideTimeoutsRef.current;

    return () => {
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

      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Failed to delete post");
    }
  };

  const toggleLike = async (id) => {
    if (!user?.uid || pendingLikeIds[id]) return;

    const currentPost = posts.find((post) => post?._id === id);
    if (!currentPost) return;

    const currentLikes = Array.isArray(currentPost.likes) ? currentPost.likes : [];
    const alreadyLiked = currentLikes.includes(user.uid);
    const optimisticLikes = alreadyLiked
      ? currentLikes.filter((uid) => uid !== user.uid)
      : [...currentLikes, user.uid];

    setPendingLikeIds((prev) => ({ ...prev, [id]: true }));
    setPosts((prev) =>
      prev.map((post) =>
        post._id === id
          ? {
              ...post,
              likes: optimisticLikes,
            }
          : post
      )
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle like: ${res.statusText}`);
      }

      const data = await res.json();
      const updatedPost = data?.data;

      if (updatedPost?._id) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === id
              ? {
                  ...post,
                  ...updatedPost,
                  userName: post.userName,
                  userEmail: post.userEmail,
                }
              : post
          )
        );
      }

      window.dispatchEvent(new Event("stats-refresh"));
    } catch (err) {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
                ...post,
                likes: currentLikes,
              }
            : post
        )
      );
      console.error("Toggle like error:", err);
      alert("Failed to like post");
    } finally {
      setPendingLikeIds((prev) => {
        const nextState = { ...prev };
        delete nextState[id];
        return nextState;
      });
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

      setCommentText((prev) => ({ ...prev, [id]: "" }));
      fetchPosts();
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Failed to add comment");
    }
  };

  const toggleComments = (id) => {
    setShowComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
          uid: user?.uid,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update post: ${res.statusText}`);
      }

      const data = await res.json();
      const updatedPost = data?.data;

      setPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
                ...post,
                ...updatedPost,
                userName: post.userName,
                userEmail: post.userEmail,
              }
            : post
        )
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
      <ProgressBar visible={loading} duration={2000} />

      <PostComposer onPostCreated={fetchPosts} />

      {loading && (
        <div className="posts-feed">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={`skeleton-${i}`} type="post" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="posts-error">
          <div className="error-icon">Warning</div>
          <h3>Failed to load posts</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchPosts} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 ? (
        <div className="empty-posts">
          <div className="empty-icon">Posts</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      ) : null}

      {!loading && !error && posts.length > 0 && (
        <div className="posts-feed">
          {posts.filter((post) => !hiddenPostIds.includes(post?._id)).map((post) => {
            if (!post?._id) return null;

            return (
              <div key={post._id} className="post-card">
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
                      type="button"
                      className="post-icon-btn hide"
                      onClick={() => hidePost(post._id)}
                      title="Hide post"
                    >
                      <PostActionIcon name="hide" className="post-eva-icon-hide" />
                    </button>

                    {post?.uid === user?.uid && (
                      <>
                        <button
                          type="button"
                          className="post-icon-btn edit"
                          onClick={() => startEdit(post)}
                          title="Edit post"
                        >
                          <PostActionIcon name="edit" className="post-eva-icon-edit" />
                        </button>
                        <button
                          type="button"
                          className="post-icon-btn delete"
                          onClick={() => deletePost(post._id)}
                          title="Delete post"
                        >
                          <PostActionIcon name="delete" className="post-eva-icon-delete" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingPostId === post._id ? (
                  <div className="edit-mode">
                    <textarea
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="edit-textarea"
                      placeholder="Edit your post..."
                    />
                    <div className="edit-actions">
                      <button type="button" onClick={() => updatePost(post._id)} className="save-btn">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingPostId(null)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="post-content">{post?.content || ""}</p>
                )}

                {post?.images?.length > 0 && (
                  <div className="post-images-container">
                    <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                      {post.images.map((img, index) => (
                        <img
                          key={index}
                          src={getMediaUrl(img)}
                          alt="post"
                          className="post-image"
                          onError={(event) => {
                            console.warn("Image failed to load:", img);
                            event.target.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

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
                      type="button"
                      className={`action-btn ${post?.likes?.includes(user?.uid) ? "liked" : ""}`}
                      onClick={() => toggleLike(post._id)}
                      disabled={Boolean(pendingLikeIds[post._id])}
                    >
                      <PostActionIcon
                        name="like"
                        active={post?.likes?.includes(user?.uid)}
                        className="post-eva-icon-like"
                      />
                      <span className="action-label">Like</span>
                    </button>

                    <button
                      type="button"
                      className={`action-btn ${showComments[post._id] ? "active" : ""}`}
                      onClick={() => toggleComments(post._id)}
                    >
                      <PostActionIcon
                        name="comment"
                        active={showComments[post._id]}
                        className="post-eva-icon-comment"
                      />
                      <span className="action-label">Comment</span>
                    </button>
                  </div>
                </div>

                {showComments[post._id] && (
                  <div className="comment-section">
                    <div className="comments-divider"></div>

                    <div className="comments-list">
                      {post?.comments?.length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first!</p>
                      ) : (
                        post?.comments?.map((comment, index) => (
                          <div key={index} className="comment">
                            <div className="comment-avatar">
                              {comment?.name?.charAt(0) || "U"}
                            </div>
                            <div className="comment-content">
                              <p className="comment-name">{comment?.name || "User"}</p>
                              <p className="comment-text">{comment?.text || ""}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="comment-input">
                      <input
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(event) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post._id]: event.target.value,
                          }))
                        }
                        className="comment-field"
                      />

                      <button
                        type="button"
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
