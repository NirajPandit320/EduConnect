import ApplyButton from "./ApplyButton";

export default function JobCard({
  job,
  userUid,
  isEligible,
  notEligibleReasons,
  appliedApplication,
  onApplied,
}) {
  const deadlineText = job?.deadline ? new Date(job.deadline).toLocaleDateString() : "Open";

  return (
    <article className={`job-card ${isEligible ? "eligible" : "not-eligible"}`}>
      <h3>{job.title}</h3>
      <p className="job-meta">{job.company}</p>
      <p className="job-meta">{job.location || "Location not specified"}</p>
      <p className="job-meta">CTC: {job.ctc || "TBD"}</p>
      <p className="job-meta">Deadline: {deadlineText}</p>

      <div className="badge-row">
        <span className={`badge ${isEligible ? "badge-eligible" : "badge-ineligible"}`}>
          {isEligible ? "Eligible" : "Not Eligible"}
        </span>
        {appliedApplication ? <span className="badge badge-applied">Applied</span> : null}
      </div>

      {!isEligible && notEligibleReasons?.length ? (
        <div className="reason-list">
          {notEligibleReasons.map((reason) => (
            <div key={reason}>- {reason}</div>
          ))}
        </div>
      ) : null}

      <ApplyButton
        jobId={job._id}
        userUid={userUid}
        isEligible={isEligible}
        appliedApplication={appliedApplication}
        onApplied={onApplied}
      />
    </article>
  );
}