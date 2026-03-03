import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const PostsList = () => {
  const { user } = useSelector((state) => state.user);

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [commentText, setCommentText] = useState({});
  const [visibleComments, setVisibleComments] = useState({});

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:5000/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    if (!newPost.trim()) return;

    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        content: newPost,
      }),
    });

    setNewPost("");
    fetchPosts();
  };

  const toggleLike = async (postId) => {
    await fetch(
      `http://localhost:5000/api/posts/${postId}/like`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      }
    );

    fetchPosts();
  };

  const addComment = async (postId) => {
    if (!commentText[postId]) return;

    await fetch(
      `http://localhost:5000/api/posts/${postId}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          text: commentText[postId],
        }),
      }
    );

    setCommentText({ ...commentText, [postId]: "" });
    fetchPosts();
  };

  const toggleCommentsVisibility = (postId) => {
    setVisibleComments({
      ...visibleComments,
      [postId]: !visibleComments[postId],
    });
  };

  return (
    <div className="posts-container">
      <h2>Create Post</h2>

      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Write something..."
        className="post-textarea"
      />

      <button onClick={createPost} className="post-button">
        Post
      </button>

      <hr />

      {posts.map((post) => (
        <div key={post._id} className="post-card">
          <h3>{post.userName}</h3>
          <p>{post.content}</p>

          <div className="post-actions">
            <button onClick={() => toggleLike(post._id)}>
              ❤️ {post.likes.length}
            </button>

            <button
              onClick={() => toggleCommentsVisibility(post._id)}
              style={{ marginLeft: "10px" }}
            >
              💬 {post.comments.length}
            </button>
          </div>

          {visibleComments[post._id] && (
            <div className="comments-section">
              <h4>Comments</h4>

              {post.comments.map((c, index) => (
                <p key={index} className="comment">
                  {c.text}
                </p>
              ))}

              <input
                type="text"
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
                Comment
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsList;