import { useEffect, useState } from "react";
import { useSelector } from "react-redux";


const PostsList = () => {
  const { user } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:5000/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    
    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
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
        body: JSON.stringify({ userId: user._id }),
      }
    );

    fetchPosts();
  };

  return (
    <div>
      <h2>Posts</h2>

      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Write something..."
      />

      <button onClick={createPost}>Post</button>

      {posts.map((post) => (
        <div key={post._id} className="post-item">
          <p><strong>{post.userId?.name}</strong></p>
          <p>{post.content}</p>

          <button onClick={() => toggleLike(post._id)}>
            Like ({post.likes.length})
          </button>
        </div>
      ))}
    </div>
  );
};

export default PostsList;