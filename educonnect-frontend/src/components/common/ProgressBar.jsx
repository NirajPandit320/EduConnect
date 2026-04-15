import { useEffect, useState } from "react";
import "./ProgressBar.css";


const ProgressBar = ({ visible = false, duration = 2000 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    setProgress(10);

    // Simulate gradual progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 30;
      });
    }, 300);

    // Complete on timer
    const timer = setTimeout(() => {
      setProgress(100);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [visible, duration]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="progress-bar-container"
      style={{
        opacity: visible || progress < 100 ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="progress-bar-fill"
        style={{
          width: `${progress}%`,
          transition:
            progress === 100 ? "width 0.3s ease" : "width 0.2s ease",
        }}
      />
    </div>
  );
};

export default ProgressBar;
