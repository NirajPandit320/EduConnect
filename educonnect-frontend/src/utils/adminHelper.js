/**
 * Admin utility functions
 */

export const isAdminLoggedIn = () => {
  return localStorage.getItem("admin") === "true";
};

export const getAdminEmail = () => {
  return localStorage.getItem("adminEmail");
};

export const setAdminSession = (email) => {
  localStorage.setItem("admin", "true");
  localStorage.setItem("adminEmail", email);
};

export const clearAdminSession = () => {
  localStorage.removeItem("admin");
  localStorage.removeItem("adminEmail");
};
