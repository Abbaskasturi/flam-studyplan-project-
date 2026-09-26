import { Lightbulb } from "lucide-react";
import "./index.css";

const EXAMPLES = [
  "JavaScript Promises",
  "React Hooks",
  "SQL Joins",
  "Operating Systems",
  "Computer Networks",
];

function EmptyState({ onSelectTopic }) {
  return (
    <section className="empty-state" aria-label="Get started">
      <span className="empty-state__icon" aria-hidden="true">
        <Lightbulb size={28} />
      </span>
      <h2 className="empty-state__title">Start a study session</h2>
      <p className="empty-state__copy">
        Enter a topic or paste notes above. We will turn them into flashcards you
        can flip, mark, and review.
      </p>
      <p className="empty-state__label">Try a topic:</p>
      <ul className="empty-state__topics">
        {EXAMPLES.map((topic) => (
          <li key={topic}>
            <button
              type="button"
              className="empty-state__chip"
              onClick={() => onSelectTopic(topic)}
            >
              {topic}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EmptyState;
