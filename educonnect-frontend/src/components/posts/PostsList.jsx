import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, likePost, addComment } from "../../store/postsSlice";

function generatePosts(count = 5) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Post ${index + 1}`,
    content: `This is the content of post ${index + 1}`,
    likes: 0,
    comments: [],
  }));
}

const PostsList = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);

  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    dispatch(setPosts(generatePosts()));
  }, [dispatch]);

  const handleLike = (id) => {
    dispatch(likePost(id));
  };

  const handleComment = (postId) => {
    const comment = commentInputs[postId];
    if (!comment) return;

    dispatch(addComment({ postId, comment }));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div className="posts-list">
      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h2>{post.title}</h2>
          <p>{post.content}</p>

          <div className="post-actions">
            <button onClick={() => handleLike(post.id)}>
              👍 {post.likes}
            </button>
          </div>

          <div className="comment-section">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInputs[post.id] || ""}
              onChange={(e) =>
                setCommentInputs({
                  ...commentInputs,
                  [post.id]: e.target.value,
                })
              }
            />
            <button onClick={() => handleComment(post.id)}>
              💬 Comment
            </button>
          </div>

          <div className="comments">
            {post.comments.map((c, index) => (
              <p key={index}>• {c}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
