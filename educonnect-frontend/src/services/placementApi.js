import axios from "axios";

const placementApi = axios.create({
  baseURL: "http://localhost:5000/api",
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
