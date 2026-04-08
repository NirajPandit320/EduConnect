import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../utils/apiConfig";

const buildQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.sort) params.set("sort", filters.sort);

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
  });
  const [commentText, setCommentText] = useState({});
  const [editingResource, setEditingResource] = useState(null);

  const fetchResources = async () => {
    setLoading(true);

    try {
      const query = buildQuery(filters);
      const response = await fetch(`${API_BASE_URL}/api/resources?${query}`);
      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [refreshKey, filters.q, filters.tag, filters.sort]);

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
    <div className="resources-list-card">
      <div className="resource-toolbar">
        <input
          value={filters.q}
          onChange={(event) => setFilters({ ...filters, q: event.target.value })}
          placeholder="Search resources"
        />

        <input
          value={filters.tag}
          onChange={(event) => setFilters({ ...filters, tag: event.target.value })}
          placeholder="Filter by tag"
        />

        <select
          value={filters.sort}
          onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
        >
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {loading ? (
        <p>Loading resources...</p>
      ) : resources.length === 0 ? (
        <p>No resources found</p>
      ) : (
        <div className="resource-feed">
          {resources.map((resource) => {
            const isOwner = resource.uploadedBy === user?.uid;
            const commentValue = commentText[resource._id] || "";

            return (
              <article key={resource._id} className="resource-item">
                <header>
                  <h4>{resource.title}</h4>
                  <p>
                    By {resource.uploaderName} | {resource.category} | v{resource.version}
                  </p>
                </header>

                <p>{resource.description}</p>

                {resource.tags?.length ? (
                  <div className="resource-tags">
                    {resource.tags.map((tag) => (
                      <span key={`${resource._id}-${tag}`}>#{tag}</span>
                    ))}
                  </div>
                ) : null}

                {resource.fileUrl ? (
                  <div className="resource-links">
                    <a
                      href={resource.fileUrl.startsWith("/uploads/") ? `${API_BASE_URL}${resource.fileUrl}` : resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => updateEngagement(resource._id, "view")}
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => updateEngagement(resource._id, "download")}
                    >
                      Mark Download
                    </button>
                  </div>
                ) : null}

                {resource.fileUrl && previewable(resource.fileUrl) ? (
                  <iframe
                    title={`preview-${resource._id}`}
                    src={resource.fileUrl.startsWith("/uploads/") ? `${API_BASE_URL}${resource.fileUrl}` : resource.fileUrl}
                    className="resource-preview"
                  />
                ) : null}

                <div className="resource-stats">
                  <span>Views: {resource.viewCount || 0}</span>
                  <span>Downloads: {resource.downloadCount || 0}</span>
                  <span>Likes: {resource.likeCount || 0}</span>
                  <span>Bookmarks: {resource.bookmarkCount || 0}</span>
                </div>

                <div className="resource-actions">
                  <button type="button" onClick={() => updateEngagement(resource._id, "like")}>
                    Like
                  </button>
                  <button type="button" onClick={() => updateEngagement(resource._id, "bookmark")}>
                    Bookmark
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateEngagement(resource._id, "report", {
                        reason: "Inappropriate content",
                      })
                    }
                  >
                    Report
                  </button>

                  {isOwner ? (
                    <>
                      <button type="button" onClick={() => setEditingResource(resource)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteResource(resource._id)}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="resource-comment-box">
                  <input
                    value={commentValue}
                    onChange={(event) =>
                      setCommentText((prev) => ({ ...prev, [resource._id]: event.target.value }))
                    }
                    placeholder="Add a comment"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!commentValue.trim()) return;
                      updateEngagement(resource._id, "comment", {
                        text: commentValue,
                      });
                      setCommentText((prev) => ({ ...prev, [resource._id]: "" }));
                    }}
                  >
                    Comment
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editingResource ? (
        <div className="resource-edit-modal">
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

          <div className="resource-edit-actions">
            <button type="button" onClick={saveEdit}>Save</button>
            <button type="button" onClick={() => setEditingResource(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ResourcesList;
