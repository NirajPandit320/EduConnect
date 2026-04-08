import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";

const placementApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const fetchJobs = async () => {
  const response = await placementApi.get("/jobs");
  return response.data;
};

export const fetchEligibility = async (uid) => {
  const response = await placementApi.get(`/jobs/eligibility/${uid}`);
  return response.data;
};

export const fetchApplications = async (uid) => {
  const response = await placementApi.get(`/applications/${uid}`);
  return response.data;
};

export const applyToJob = async ({ jobId, userUid }) => {
  const response = await placementApi.post("/applications/apply", { jobId, userUid });
  return response.data;
};

export default placementApi;
