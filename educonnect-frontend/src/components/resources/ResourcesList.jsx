import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getMediaUrl } from "../../utils/media";
import {
  FiBookmark,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFlag,
  FiHeart,
  FiMessageCircle,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

const buildQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.uid) params.set("uid", filters.uid);

  return params.toString();
};

const ResourcesList = ({ refreshKey }) => {
  const { user } = useSelector((state) => state.user);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    tag: "",
    sort: "recent",
    uid: "",
  });
  const [commentText, setCommentText] = useState({});
  const [editingResource, setEditingResource] = useState(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);

    try {
      const query = buildQuery(filters);
      const response = await fetch(`${API_BASE_URL}/api/resources?${query}`);
      const payload = await response.json();
      const data = payload?.data ?? payload;
      const list = Array.isArray(data) ? data : data?.resources;
      setResources(Array.isArray(list) ? list : []);
    } catch (error) {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, uid: user?.uid || "" }));
  }, [user?.uid]);

  useEffect(() => {
    fetchResources();
  }, [refreshKey, fetchResources]);

  const updateEngagement = async (resourceId, action, payload = {}) => {
    await fetch(`${API_BASE_URL}/api/resources/${resourceId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user?.uid, ...payload }),
    });

    fetchResources();
  };

  const deleteResource = async (resourceId) => {
    await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user?.uid }),
    });

    fetchResources();
  };

  const saveEdit = async () => {
    if (!editingResource) return;

    const payload = {
      uid: user?.uid,
      title: editingResource.title,
      description: editingResource.description,
      tags: editingResource.tags,
      visibility: editingResource.visibility,
      category: editingResource.category,
    };

    await fetch(`${API_BASE_URL}/api/resources/${editingResource._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingResource(null);
    fetchResources();
  };

  const previewable = useMemo(
    () => (url) => typeof url === "string" && /\.pdf($|\?)/i.test(url),
    []
  );

  return (
    <div className="resources-list-card rm-list-card">
      <div className="rm-toolbar-wrap">
        <div className="rm-toolbar-title-block">
          <h3>Resource Library</h3>
          <p>Explore files, links, and shared learning materials.</p>
        </div>

        <div className="resource-toolbar rm-toolbar">
          <div className="rm-field rm-field-search">
            <FiSearch />
            <input
              value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })}
              placeholder="Search resources"
            />
          </div>

          <input
            className="rm-field-input"
            value={filters.tag}
            onChange={(event) => setFilters({ ...filters, tag: event.target.value })}
            placeholder="Filter by tag"
          />

          <select
            className="rm-field-input rm-sort"
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="rm-state-message">Loading resources...</p>
      ) : resources.length === 0 ? (
        <p className="rm-state-message">No resources found</p>
      ) : (
        <div className="resource-feed rm-feed">
          {resources.map((resource) => {
            const isOwner = resource.uploadedBy === user?.uid;
            const commentValue = commentText[resource._id] || "";
            const mediaUrl = resource.fileUrl ? getMediaUrl(resource.fileUrl) : "";

            return (
              <article key={resource._id} className="resource-item rm-item">
                <header className="rm-item-header">
                  <div>
                    <h4>{resource.title}</h4>
                    <p>
                      By {resource.uploaderName} | {resource.category} | v{resource.version}
                    </p>
                  </div>
                  <span className={`rm-visibility rm-visibility-${resource.visibility}`}>
                    {resource.visibility}
                  </span>
                </header>

                <p className="rm-description">{resource.description || "No description provided."}</p>

                {resource.tags?.length ? (
                  <div className="resource-tags rm-tags">
                    {resource.tags.map((tag) => (
                      <span key={`${resource._id}-${tag}`}>#{tag}</span>
                    ))}
                  </div>
                ) : null}

                {resource.fileUrl ? (
                  <div className="resource-links rm-links">
                    <a
                      className="rm-btn rm-btn-primary"
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => updateEngagement(resource._id, "view", { uid: user?.uid })}
                    >
                      <FiEye /> Open
                    </a>
                    <button
                      className="rm-btn rm-btn-secondary"
                      type="button"
                      onClick={() => updateEngagement(resource._id, "download", { uid: user?.uid })}
                    >
                      <FiDownload /> Mark Download
                    </button>
                  </div>
                ) : null}

                <div className="resource-metadata rm-meta">
                  {resource.fileName ? <span>File: {resource.fileName}</span> : null}
                  {resource.mimeType ? <span>Type: {resource.mimeType}</span> : null}
                  {resource.fileSize ? (
                    <span>Size: {(resource.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  ) : null}
                </div>

                {resource.fileUrl && previewable(resource.fileUrl) ? (
                  <iframe
                    title={`preview-${resource._id}`}
                    src={mediaUrl}
                    className="resource-preview rm-preview"
                  />
                ) : null}

                <div className="resource-stats rm-stats">
                  <span>
                    <FiEye /> {resource.viewCount || 0}
                  </span>
                  <span>
                    <FiDownload /> {resource.downloadCount || 0}
                  </span>
                  <span>
                    <FiHeart /> {resource.likeCount || 0}
                  </span>
                  <span>
                    <FiBookmark /> {resource.bookmarkCount || 0}
                  </span>
                </div>

                <div className="resource-actions rm-actions">
                  <button
                    className="rm-btn rm-btn-ghost"
                    type="button"
                    onClick={() => updateEngagement(resource._id, "like")}
                  >
                    <FiHeart /> Like
                  </button>
                  <button
                    className="rm-btn rm-btn-ghost"
                    type="button"
                    onClick={() => updateEngagement(resource._id, "bookmark")}
                  >
                    <FiBookmark /> Bookmark
                  </button>
                  <button
                    className="rm-btn rm-btn-ghost"
                    type="button"
                    onClick={() =>
                      updateEngagement(resource._id, "report", {
                        reason: "Inappropriate content",
                      })
                    }
                  >
                    <FiFlag /> Report
                  </button>

                  {isOwner ? (
                    <>
                      <button
                        className="rm-btn rm-btn-secondary"
                        type="button"
                        onClick={() => setEditingResource(resource)}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        className="rm-btn rm-btn-danger"
                        type="button"
                        onClick={() => deleteResource(resource._id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="resource-comment-box rm-comment-box">
                  <input
                    value={commentValue}
                    onChange={(event) =>
                      setCommentText((prev) => ({ ...prev, [resource._id]: event.target.value }))
                    }
                    placeholder="Add a comment"
                  />
                  <button
                    className="rm-btn rm-btn-primary"
                    type="button"
                    onClick={() => {
                      if (!commentValue.trim()) return;
                      updateEngagement(resource._id, "comment", {
                        text: commentValue,
                      });
                      setCommentText((prev) => ({ ...prev, [resource._id]: "" }));
                    }}
                  >
                    <FiMessageCircle /> Comment
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editingResource ? (
        <div className="resource-edit-modal rm-edit-modal">
          <h4>Edit Resource</h4>
          <input
            value={editingResource.title}
            onChange={(event) =>
              setEditingResource((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Title"
          />
          <textarea
            value={editingResource.description}
            onChange={(event) =>
              setEditingResource((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={3}
            placeholder="Description"
          />
          <input
            value={Array.isArray(editingResource.tags) ? editingResource.tags.join(",") : ""}
            onChange={(event) =>
              setEditingResource((prev) => ({ ...prev, tags: event.target.value }))
            }
            placeholder="Tags"
          />
          <select
            value={editingResource.visibility}
            onChange={(event) =>
              setEditingResource((prev) => ({ ...prev, visibility: event.target.value }))
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <div className="resource-edit-actions rm-edit-actions">
            <button className="rm-btn rm-btn-primary" type="button" onClick={saveEdit}>
              Save
            </button>
            <button className="rm-btn rm-btn-secondary" type="button" onClick={() => setEditingResource(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ResourcesList;
