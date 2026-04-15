import "./SkeletonCard.css";


const SkeletonCard = ({ type = "post" }) => {
  if (type === "post") {
    return (
      <div className="skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-text skeleton-text-lg"></div>
            <div className="skeleton-text skeleton-text-sm"></div>
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-text skeleton-text-full"></div>
          <div className="skeleton-text skeleton-text-full"></div>
          <div className="skeleton-text skeleton-text-half"></div>
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }

  if (type === "event") {
    return (
      <div className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-text skeleton-text-lg"></div>
          <div className="skeleton-text skeleton-text-full"></div>
          <div className="skeleton-text skeleton-text-full"></div>
          <div className="skeleton-meta">
            <div className="skeleton-text skeleton-text-sm"></div>
            <div className="skeleton-text skeleton-text-sm"></div>
          </div>
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonCard;
