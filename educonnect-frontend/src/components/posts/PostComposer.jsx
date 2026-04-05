import { useState } from "react";
import { useSelector } from "react-redux";

const PostComposer = ({ onPostCreated }) => {
  const { user } = useSelector((state) => state.user);
  const API = "http://localhost:5000";

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const createPost = async () => {
    if (!content && images.length === 0) return;

    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("content", content);

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const response = await fetch(`${API}/api/posts`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setContent("");
        setImages([]);
        setPreviewImages([]);

        onPostCreated();

        // ADDED: Emit event to trigger dashboard stats refresh
        window.dispatchEvent(new Event("stats-refresh"));
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="composer-wrapper">
      <div className="post-composer">

        <div className="composer-header">
          <div className="composer-user">
            <div className="composer-avatar">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="composer-user-info">
              <p className="composer-name">{user?.name || "User"}</p>
              <span className="composer-status">Share your thoughts...</span>
            </div>
          </div>
        </div>

        <textarea
          placeholder="What's on your mind? 💭"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="composer-textarea"
        />

        {previewImages.length > 0 && (
          <div className="preview-row">
            <div className="preview-title">📸 Images ({previewImages.length})</div>
            <div className="preview-items">
              {previewImages.map((img, i) => (
                <div key={i} className="preview-item">
                  <img src={img} alt="preview" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="composer-toolbar">
          <label className="upload-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Add Image
            <input
              type="file"
              multiple
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          <button
            className="post-btn"
            onClick={createPost}
            disabled={!content && previewImages.length === 0}
          >
            <span className="post-btn-icon">✨</span>
            <span className="post-btn-text">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;