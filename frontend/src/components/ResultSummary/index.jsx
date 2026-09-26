import { RefreshCw, Trophy } from "lucide-react";
import "./index.css";

function ResultSummary({
  total,
  correct,
  incorrect,
  onReviewWrong,
  onNewSession,
  reviewAvailable,
}) {
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <section className="summary" aria-live="polite">
      <span className="summary__icon" aria-hidden="true">
        <Trophy size={26} />
      </span>
      <h2 className="summary__title">Study session complete</h2>
      <p className="summary__copy">Here is how this round went.</p>

      <ul className="summary__stats">
        <li>
          <strong>{total}</strong>
          <span>Cards</span>
        </li>
        <li>
          <strong>{correct}</strong>
          <span>Correct</span>
        </li>
        <li>
          <strong>{incorrect}</strong>
          <span>Incorrect</span>
        </li>
        <li>
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </li>
      </ul>

      <div className="summary__actions">
        <button
          type="button"
          className="summary__btn summary__btn--secondary"
          onClick={onReviewWrong}
          disabled={!reviewAvailable}
        >
          Review Wrong Answers
        </button>
        <button type="button" className="summary__btn summary__btn--primary" onClick={onNewSession}>
          <RefreshCw size={16} aria-hidden="true" />
          Start New Session
        </button>
      </div>
    </section>
  );
}

export default ResultSummary;
