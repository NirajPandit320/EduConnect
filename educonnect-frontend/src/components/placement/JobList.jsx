import JobCard from "./JobCard";

export default function JobList({
  jobs,
  loading,
  userUid,
  appliedJobMap,
  eligibleJobIds,
  notEligibleReasonsMap,
  onApplied,
}) {
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <section className="placement-card">
      <h3 className="section-title">Job Listings</h3>

      {loading ? (
        <div className="jobs-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="loading-shimmer" />
          ))}
        </div>
      ) : null}

      {!loading && safeJobs.length === 0 ? <p>No jobs posted yet.</p> : null}

      {!loading ? (
        <div className="jobs-grid">
          {safeJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              userUid={userUid}
              isEligible={eligibleJobIds.has(job._id)}
              notEligibleReasons={notEligibleReasonsMap[job._id] || []}
              appliedApplication={appliedJobMap[job._id] || null}
              onApplied={onApplied}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}