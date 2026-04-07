import { useState } from "react";
import { applyToJob } from "../../services/placementApi";

export default function ApplyButton({
  jobId,
  userUid,
  isEligible,
  appliedApplication,
  onApplied,
}) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const alreadyApplied = Boolean(appliedApplication);

  const handleApply = async () => {
    if (!userUid) {
      setFeedback({ type: "error", message: "Login required to apply." });
      return;
    }

    if (!isEligible || alreadyApplied) {
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });

      const data = await applyToJob({ jobId, userUid });
      setFeedback({ type: "success", message: data?.message || "Applied successfully." });

      if (typeof onApplied === "function") {
        onApplied(data?.message || "Application submitted successfully.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to submit application.";
      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = alreadyApplied ? "Applied" : isEligible ? "Apply Now" : "Not Eligible";

  const buttonClass = alreadyApplied
    ? "apply-btn applied"
    : isEligible
      ? "apply-btn"
      : "apply-btn not-eligible";

  return (
    <>
      <button
        className={buttonClass}
        disabled={loading || alreadyApplied || !isEligible}
        onClick={handleApply}
      >
        {loading ? "Applying..." : buttonLabel}
      </button>

      {feedback.message ? (
        <div className={`inline-feedback ${feedback.type}`}>{feedback.message}</div>
      ) : null}
    </>
  );
}