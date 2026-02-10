function generatePosts(count = 20) {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return {
      id,
      title: `Post ${id}`,
      content: `This is the content of post number ${id}.`,
    };
  });
}

const PostsList = () => {
  const posts = generatePosts();
  return (
    <div className="posts-list">
      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div className="post-actions">
            <button className="icon">*</button>
            <button className="icon">C</button>

          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsList;