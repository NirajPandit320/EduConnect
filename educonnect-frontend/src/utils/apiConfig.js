import { API } from "../config/api";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API;

// Keep API_BASE_URL export for backward compatibility across existing imports.
const API_BASE_URL = API;

export { API, API_BASE_URL, SOCKET_URL };
