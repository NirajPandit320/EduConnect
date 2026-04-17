import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";
import { FiCheckCircle, FiUploadCloud, FiLink2, FiTag, FiUsers } from "react-icons/fi";

const MAX_FILE_MB = 20;

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeIcon = (mimeType, fileName) => {
  if (mimeType?.startsWith("image/")) return "🖼";
  if (mimeType?.includes("pdf") || /\.pdf$/i.test(fileName || "")) return "📄";
  if (mimeType?.includes("presentation") || /\.(ppt|pptx)$/i.test(fileName || "")) return "📊";
  if (mimeType?.includes("word") || /\.(doc|docx)$/i.test(fileName || "")) return "📝";
  if (mimeType?.startsWith("video/")) return "🎬";
  if (mimeType?.startsWith("audio/")) return "🎧";
  if (mimeType?.includes("zip") || /\.(zip|rar|7z)$/i.test(fileName || "")) return "🗜";
  if (/\.(js|jsx|ts|tsx|py|java|cpp|c|cs|go|rb|php)$/i.test(fileName || "")) return "💻";
  return "📁";
};

const ResourceUpload = ({ onUploaded }) => {
  const { user } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    tags: "",
    visibility: "public",
    resourceType: "file",
    category: "notes",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const payload = await response.json();
        const data = payload?.data ?? payload;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : [];
        setUsers(list.filter((item) => item?.uid && item.uid !== user?.uid));
      } catch (fetchError) {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  const dragHint = useMemo(() => {
    if (files.length === 0) return "Drag and drop files here";
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  const validateFiles = (incoming) => {
    for (const file of incoming) {
      const tooLarge = file.size > MAX_FILE_MB * 1024 * 1024;
      if (tooLarge) {
        return `Each file must be under ${MAX_FILE_MB}MB`;
      }
    }

    return "";
  };

  const handleFileSelection = (incoming) => {
    const list = Array.from(incoming || []);
    const validationError = validateFiles(list);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setFiles(list);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileSelection(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!user?.uid) {
      setError("Please sign in before uploading");
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!form.fileUrl.trim() && files.length === 0) {
      setError("Provide a resource link or at least one file");
      return;
    }

    if (form.visibility === "private" && selectedUsers.length === 0) {
      setError("Select at least one user for private resources");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("fileUrl", form.fileUrl.trim());
      payload.append("uploaderUid", user.uid);
      payload.append("tags", form.tags);
      payload.append("visibility", form.visibility);
      payload.append("resourceType", form.resourceType);
      payload.append("category", form.category);
      payload.append("allowedUsers", JSON.stringify(selectedUsers));

      files.forEach((file) => {
        payload.append("files", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      setSuccess("Resource uploaded successfully");
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        fileUrl: "",
        tags: "",
      }));
      setFiles([]);
      setSelectedUsers([]);
      onUploaded?.();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resource-upload-card rm-upload-card">
      <div className="rm-upload-head">
        <h3>Upload Resource</h3>
        <p>Share notes, videos, repositories, and files with clean metadata.</p>
      </div>

      <div className="resource-upload-grid rm-upload-grid">
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="Resource title"
        />

        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        >
          <option value="notes">Notes</option>
          <option value="ppt">PPT</option>
          <option value="docs">Docs</option>
          <option value="image">Image</option>
          <option value="code">Code</option>
          <option value="repository">Repository</option>
          <option value="video">Video</option>
        </select>

        <select
          value={form.visibility}
          onChange={(event) => {
            const nextVisibility = event.target.value;
            setForm({ ...form, visibility: nextVisibility });
            if (nextVisibility === "public") {
              setSelectedUsers([]);
            }
          }}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <select
          value={form.resourceType}
          onChange={(event) => setForm({ ...form, resourceType: event.target.value })}
        >
          <option value="file">File</option>
          <option value="link">Link</option>
          <option value="repository">Repository</option>
          <option value="code">Code</option>
          <option value="video">Video</option>
        </select>
      </div>

      <textarea
        className="rm-textarea"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        placeholder="Description"
        rows={3}
      />

      <div className="rm-upload-inline-fields">
        <div className="rm-field rm-inline-field">
          <FiLink2 />
          <input
            value={form.fileUrl}
            onChange={(event) => setForm({ ...form, fileUrl: event.target.value })}
            placeholder="Optional external link (YouTube, GitHub, Drive, etc.)"
          />
        </div>

        <div className="rm-field rm-inline-field">
          <FiTag />
          <input
            value={form.tags}
            onChange={(event) => setForm({ ...form, tags: event.target.value })}
            placeholder="Tags (comma separated)"
          />
        </div>
      </div>

      <label
        className="resource-dropzone rm-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={(event) => handleFileSelection(event.target.files)}
          hidden
        />
        <span>
          <FiUploadCloud /> {dragHint}
        </span>
        <small>All file types supported (max {MAX_FILE_MB}MB each)</small>
      </label>

      {files.length > 0 ? (
        <div className="resource-file-preview-list">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="resource-file-preview-item">
              <span className="resource-file-icon">{getFileTypeIcon(file.type, file.name)}</span>
              <div>
                <p>{file.name}</p>
                <small>{file.type || "Unknown"} | {formatFileSize(file.size)}</small>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {form.visibility === "private" ? (
        <div className="resource-private-select-box rm-private-select-box">
          <p>
            <FiUsers /> Select users who can access this resource
          </p>
          <div className="resource-private-user-list">
            {users.length === 0 ? (
              <small>No users available</small>
            ) : (
              users.map((item) => {
                const checked = selectedUsers.includes(item.uid);

                return (
                  <label key={item.uid} className="resource-private-user-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedUsers((prev) => (
                          checked
                            ? prev.filter((uid) => uid !== item.uid)
                            : [...prev, item.uid]
                        ));
                      }}
                    />
                    <span>{item.name || item.email || item.uid}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="resource-error">{error}</p> : null}
      {success ? (
        <p className="resource-success">
          <FiCheckCircle /> {success}
        </p>
      ) : null}

      <button className="rm-btn rm-btn-primary rm-upload-submit" type="button" onClick={handleUpload} disabled={uploading}>
        <FiUploadCloud /> {uploading ? "Uploading..." : "Upload Resource"}
      </button>
    </div>
  );
};

export default ResourceUpload;
