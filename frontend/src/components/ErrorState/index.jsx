import { AlertCircle, RotateCcw } from "lucide-react";
import "./index.css";

function ErrorState({ title, detail, onRetry }) {
  return (
    <section className="error-state" role="alert">
      <span className="error-state__icon" aria-hidden="true">
        <AlertCircle size={24} />
      </span>
      <h2 className="error-state__title">
        {title || "Something went wrong while generating your cards."}
      </h2>
      <p className="error-state__copy">
        {detail || "Please try again with the same topic."}
      </p>
      <button type="button" className="error-state__retry" onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" />
        Try Again
      </button>
    </section>
  );
}

export default ErrorState;
