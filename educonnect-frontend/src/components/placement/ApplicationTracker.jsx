export default function ApplicationTracker({ applications, loading }) {
  const safeApplications = Array.isArray(applications) ? applications : [];

  return (
    <section className="placement-card">
      <h3 className="section-title">Application Tracker</h3>

      {loading ? (
        <div className="application-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="loading-shimmer" />
          ))}
        </div>
      ) : null}

      {!loading && safeApplications.length === 0 ? (
        <p>You have not applied to any jobs yet.</p>
      ) : null}

      {!loading ? (
        <div className="application-list">
          {safeApplications.map((application) => (
            <div key={application._id} className="app-item">
              <div>
                <strong>{application.jobId?.title || "Untitled Job"}</strong>
                <div className="job-meta">{application.jobId?.company || "Unknown Company"}</div>
              </div>

              <span className={`badge status-badge status-${application.status}`}>
                {application.status}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}