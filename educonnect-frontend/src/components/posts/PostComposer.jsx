import { useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";
import PostActionIcon from "./PostActionIcon";

const PostComposer = ({ onPostCreated }) => {
  const { user } = useSelector((state) => state.user);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const createPost = async () => {
    if ((!content || !content.trim()) && images.length === 0) return;

    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("content", content);

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      setIsPosting(true);
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setContent("");
        setImages([]);
        setPreviewImages([]);

        onPostCreated();
        window.dispatchEvent(new Event("stats-refresh"));
      } else {
        alert(data?.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsPosting(false);
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
          placeholder="What's on your mind?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="composer-textarea"
        />

        {previewImages.length > 0 && (
          <div className="preview-row">
            <div className="preview-title">Images ({previewImages.length})</div>
            <div className="preview-items">
              {previewImages.map((img, index) => (
                <div key={index} className="preview-item">
                  <img src={img} alt="preview" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="composer-toolbar">
          <label className="upload-btn">
            <PostActionIcon name="image" className="post-eva-icon-image" />
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
            type="button"
            className="post-btn"
            onClick={createPost}
            disabled={isPosting || ((!content || !content.trim()) && previewImages.length === 0)}
          >
            <PostActionIcon name="post" className="post-eva-icon-post" />
            <span className="post-btn-text">{isPosting ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
