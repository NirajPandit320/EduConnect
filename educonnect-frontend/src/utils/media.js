import { API_BASE_URL } from "./apiConfig";

export const getMediaUrl = (value) => {
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/uploads/${value}`;
};
