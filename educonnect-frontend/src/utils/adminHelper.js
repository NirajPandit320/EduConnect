import { API_BASE_URL } from "./apiConfig";

const ADMIN_TOKEN_KEY = "adminSessionToken";
const ADMIN_EMAIL_KEY = "adminEmail";
const ADMIN_FLAG_KEY = "admin";

export const isAdminLoggedIn = () => {
  return (
    localStorage.getItem(ADMIN_FLAG_KEY) === "true" &&
    Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
  );
};

export const getAdminEmail = () => {
  return localStorage.getItem(ADMIN_EMAIL_KEY);
};

export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminSession = (email, sessionToken) => {
  localStorage.setItem(ADMIN_FLAG_KEY, "true");
  localStorage.setItem(ADMIN_EMAIL_KEY, email);
  localStorage.setItem(ADMIN_TOKEN_KEY, sessionToken);
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_FLAG_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok || result.success !== true) {
    throw new Error(result.message || "Admin login failed");
  }

  const sessionToken = result?.data?.sessionToken;
  const adminEmail = result?.data?.email || email;

  if (!sessionToken) {
    throw new Error("Admin login succeeded but no session token was returned");
  }

  setAdminSession(adminEmail, sessionToken);
  return result;
};

export const adminFetch = async (path, options = {}) => {
  const token = getAdminToken();
  const email = getAdminEmail();

  if (!token) {
    clearAdminSession();
    throw new Error("Admin session missing. Please log in again.");
  }

  const { headers = {}, method = "GET", body } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "X-Admin-Session": token,
      ...(email ? { email } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAdminSession();
    throw new Error(result.message || "Unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(result.message || "Admin request failed");
  }

  return result;
};

export const fetchAdminStats = async () => {
  return adminFetch("/api/admin/stats", { method: "GET" });
};
