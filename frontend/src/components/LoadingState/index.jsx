import { LoaderCircle, Sparkles } from "lucide-react";
import "./index.css";

function LoadingState() {
  return (
    <section className="loading-state" aria-live="polite" aria-busy="true">
      <LoaderCircle className="loading-state__spinner" size={28} aria-hidden="true" />
      <h2 className="loading-state__title">Generating your study session...</h2>
      <p className="loading-state__copy">
        <Sparkles size={14} aria-hidden="true" /> Creating and validating your flashcards
      </p>
    </section>
  );
}

export default LoadingState;
