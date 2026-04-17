import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";

const placementApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const fetchJobs = async () => {
  const response = await placementApi.get("/jobs");
  const payload = response.data;
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.jobs) ? data.jobs : [];
};

export const fetchEligibility = async (uid) => {
  const response = await placementApi.get(`/jobs/eligibility/${uid}`);
  const payload = response.data;
  const data = payload?.data ?? payload;

  return {
    eligibleJobs: Array.isArray(data?.eligibleJobs) ? data.eligibleJobs : [],
    notEligibleJobs: Array.isArray(data?.notEligibleJobs) ? data.notEligibleJobs : [],
  };
};

export const fetchApplications = async (uid) => {
  const response = await placementApi.get(`/applications/${uid}`);
  const payload = response.data;
  const data = payload?.data ?? payload;

  return Array.isArray(data) ? data : [];
};

export const applyToJob = async ({ jobId, userUid }) => {
  const response = await placementApi.post("/applications/apply", { jobId, userUid });
  return response.data;
};

export default placementApi;
