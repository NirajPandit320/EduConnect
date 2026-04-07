import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import JobList from "../components/placement/JobList";
import EligibilityChecker from "../components/placement/EligibilityChecker";
import ApplicationTracker from "../components/placement/ApplicationTracker";
import {
  fetchApplications,
  fetchEligibility,
  fetchJobs,
} from "../services/placementApi";
import "../components/placement/placement.css";

export default function PlacementPage() {
  const { user } = useSelector((state) => state.user);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [eligibility, setEligibility] = useState({ eligibleJobs: [], notEligibleJobs: [] });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const [toast, setToast] = useState("");

  const uid = user?.uid || "";

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await fetchJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    if (!uid) {
      setApplications([]);
      setLoadingApplications(false);
      return;
    }

    setLoadingApplications(true);
    try {
      const data = await fetchApplications(uid);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [uid]);

  const loadEligibility = useCallback(async () => {
    if (!uid) {
      setEligibility({ eligibleJobs: [], notEligibleJobs: [] });
      setLoadingEligibility(false);
      return;
    }

    setLoadingEligibility(true);
    try {
      const data = await fetchEligibility(uid);
      setEligibility({
        eligibleJobs: Array.isArray(data?.eligibleJobs) ? data.eligibleJobs : [],
        notEligibleJobs: Array.isArray(data?.notEligibleJobs) ? data.notEligibleJobs : [],
      });
    } catch (error) {
      setEligibility({ eligibleJobs: [], notEligibleJobs: [] });
    } finally {
      setLoadingEligibility(false);
    }
  }, [uid]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    loadApplications();
    loadEligibility();
  }, [loadApplications, loadEligibility]);

  const appliedJobMap = useMemo(() => {
    return applications.reduce((acc, app) => {
      if (app?.jobId?._id) {
        acc[app.jobId._id] = app;
      }
      return acc;
    }, {});
  }, [applications]);

  const eligibleJobIds = useMemo(
    () => new Set((eligibility.eligibleJobs || []).map((job) => job._id)),
    [eligibility.eligibleJobs]
  );

  const notEligibleReasonsMap = useMemo(() => {
    return (eligibility.notEligibleJobs || []).reduce((acc, item) => {
      if (item?.job?._id) {
        acc[item.job._id] = item.reasons || [];
      }
      return acc;
    }, {});
  }, [eligibility.notEligibleJobs]);

  const handleApplied = async (message) => {
    setToast(message || "Application submitted successfully.");
    await Promise.all([loadApplications(), loadEligibility()]);
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <div className="placement-page">
      <div className="placement-hero">
        <h2>Placement Dashboard</h2>
        <p>Discover opportunities, check eligibility, and track your applications in one place.</p>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}

      <div className="placement-grid">
        <EligibilityChecker
          loading={loadingEligibility}
          eligibleJobs={eligibility.eligibleJobs}
          notEligibleJobs={eligibility.notEligibleJobs}
        />

        <ApplicationTracker
          loading={loadingApplications}
          applications={applications}
        />

        <JobList
          jobs={jobs}
          loading={loadingJobs}
          userUid={uid}
          appliedJobMap={appliedJobMap}
          eligibleJobIds={eligibleJobIds}
          notEligibleReasonsMap={notEligibleReasonsMap}
          onApplied={handleApplied}
        />
      </div>
    </div>
  );
}