import { API_BASE_URL } from "./apiConfig";
import { adminFetch } from "./adminHelper";

// USERS API
export const fetchAllUsers = async () => {
  return adminFetch("/api/users", { method: "GET" });
};

export const setUserBlockStatus = async (userId, blocked) => {
  return adminFetch(`/api/users/${userId}/block`, {
    method: "PATCH",
    body: { blocked: Boolean(blocked) },
  });
};

// Backward-compatible alias for older callers.
export const deleteUser = async (userId) => {
  return setUserBlockStatus(userId, true);
};

// POSTS API
export const fetchAllPosts = async (page = 1, limit = 10) => {
  const response = await adminFetch(`/api/posts?page=${page}&limit=${limit}`, {
    method: "GET",
  });

  // Supports both standardized response { data: { posts } } and legacy { posts }.
  return response?.data || response;
};

export const deletePost = async (postId) => {
  return adminFetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
};

// EVENTS API
export const fetchAllEvents = async (page = 1, limit = 10, status = "all") => {
  const response = await adminFetch(
    `/api/events?page=${page}&limit=${limit}&status=${encodeURIComponent(status)}`,
    { method: "GET" }
  );

  return response?.data || response;
};

export const createEvent = async (eventData) => {
  const formData = new FormData();
  Object.keys(eventData).forEach((key) => {
    if (key === "image" && eventData[key]) {
      formData.append(key, eventData[key]);
    } else {
      formData.append(key, eventData[key]);
    }
  });

  const token = localStorage.getItem("adminSessionToken");
  const email = localStorage.getItem("adminEmail");

  if (!token) {
    throw new Error("Admin session missing");
  }

  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: "POST",
    headers: {
      Authorization: token,
      "X-Admin-Session": token,
      ...(email ? { email } : {}),
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create event");
  }

  return result;
};

export const updateEventStatus = async (eventId, status) => {
  return adminFetch(`/api/admin/events/${eventId}/status`, {
    method: "PATCH",
    body: { status },
  });
};

export const deleteEvent = async (eventId) => {
  return adminFetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
};

// JOBS API
export const fetchAllJobs = async (page = 1, limit = 10) => {
  return adminFetch(`/api/jobs?page=${page}&limit=${limit}`, { method: "GET" });
};

export const createJob = async (jobData) => {
  return adminFetch("/api/jobs", {
    method: "POST",
    body: jobData,
  });
};

export const deleteJob = async (jobId) => {
  return adminFetch(`/api/jobs/${jobId}`, { method: "DELETE" });
};

// RESOURCES API
export const fetchAllResources = async (page = 1, limit = 10) => {
  return adminFetch(`/api/resources?page=${page}&limit=${limit}`, { method: "GET" });
};

export const uploadResource = async (resourceData) => {
  const formData = new FormData();

  Object.keys(resourceData).forEach((key) => {
    if (key === "files" && resourceData[key]) {
      Array.from(resourceData[key]).forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append(key, resourceData[key]);
    }
  });

  const token = localStorage.getItem("adminSessionToken");
  const email = localStorage.getItem("adminEmail");

  if (!token) {
    throw new Error("Admin session missing");
  }

  const response = await fetch(`${API_BASE_URL}/api/resources`, {
    method: "POST",
    headers: {
      Authorization: token,
      "X-Admin-Session": token,
      ...(email ? { email } : {}),
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload resource");
  }

  return result;
};

export const deleteResource = async (resourceId) => {
  return adminFetch(`/api/resources/${resourceId}`, { method: "DELETE" });
};

// NOTIFICATIONS API
export const createNotification = async (notificationData) => {
  return adminFetch("/api/notifications", {
    method: "POST",
    body: notificationData,
  });
};

export const fetchNotifications = async (userId) => {
  return adminFetch(`/api/notifications/${userId}`, { method: "GET" });
};

// ADMIN STATS
export const fetchAdminStats = async () => {
  return adminFetch("/api/admin/stats", { method: "GET" });
};
