export default function EligibilityChecker({ loading, eligibleJobs, notEligibleJobs }) {
  const safeEligibleJobs = Array.isArray(eligibleJobs) ? eligibleJobs : [];
  const safeNotEligibleJobs = Array.isArray(notEligibleJobs) ? notEligibleJobs : [];

  return (
    <section className="placement-card">
      <h3 className="section-title">Eligibility Checker</h3>

      {loading ? (
        <div className="jobs-grid">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="loading-shimmer" />
          ))}
        </div>
      ) : null}

      {!loading ? (
        <>
          <h4 style={{ color: "#0f766e", marginBottom: "8px" }}>Eligible Jobs</h4>
          {safeEligibleJobs.length === 0 ? <p>No eligible jobs right now.</p> : null}
          <div className="jobs-grid" style={{ marginBottom: "12px" }}>
            {safeEligibleJobs.map((job) => (
              <article className="job-card eligible" key={job._id}>
                <strong>{job.title}</strong>
                <div className="job-meta">{job.company}</div>
                <div className="job-meta">CTC: {job.ctc || "TBD"}</div>
              </article>
            ))}
          </div>

          <h4 style={{ color: "#dc2626", marginBottom: "8px" }}>Not Eligible</h4>
          {safeNotEligibleJobs.length === 0 ? <p>Great news, no ineligible jobs found.</p> : null}
          <div className="jobs-grid">
            {safeNotEligibleJobs.map((item) => (
              <article className="job-card not-eligible" key={item?.job?._id}>
                <strong>{item?.job?.title || "Untitled Job"}</strong>
                <div className="job-meta">{item?.job?.company || "Unknown Company"}</div>
                <div className="reason-list">Reason: {(item?.reasons || []).join(", ")}</div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
