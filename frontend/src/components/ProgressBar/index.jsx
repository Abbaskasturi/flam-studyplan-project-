import "./index.css";

function ProgressBar({ completed, total }) {
  const safeTotal = total || 0;
  const value = Math.min(completed, safeTotal);
  const percent = safeTotal === 0 ? 0 : Math.round((value / safeTotal) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__meta">
        <p className="progress-bar__label">
          {value} / {safeTotal} completed
        </p>
        <p className="progress-bar__percent">{percent}% complete</p>
      </div>
      <progress
        className="progress-bar__meter"
        max={safeTotal || 1}
        value={value}
        aria-label="Study session progress"
      />
    </div>
  );
}

export default ProgressBar;
