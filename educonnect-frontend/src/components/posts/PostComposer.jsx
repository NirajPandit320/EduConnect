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

    await fetch(`${API}/api/posts`, {
      method: "POST",
      body: formData,
    });

    setContent("");
    setImages([]);
    setPreviewImages([]);

    onPostCreated();
  };

  return (
    <div className="post-composer">

      <textarea
        placeholder="Share something with your classmates..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {previewImages.length > 0 && (
        <div className="preview-row">
          {previewImages.map((img, i) => (
            <img key={i} src={img} alt="preview" />
          ))}
        </div>
      )}

      <div className="composer-toolbar">

        <label className="upload-btn">
          📷 Image
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <button className="post-btn" onClick={createPost}>
          Post
        </button>

      </div>
    </div>
  );
};

export default PostComposer;