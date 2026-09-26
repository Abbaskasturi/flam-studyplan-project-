import { useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Flashcard from "../Flashcard";
import ProgressBar from "../ProgressBar";
import "./index.css";

function FlashcardDeck({
  title,
  description,
  cards,
  currentIndex,
  flipped,
  answers,
  onFlip,
  onMark,
  onPrevious,
  onNext,
  onBackToSummary,
  reviewMode,
}) {
  const card = cards[currentIndex];
  const completed = cards.filter((item) => answers[item.id]).length;

  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      } else if (event.key === " ") {
        event.preventDefault();
        onFlip();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFlip, onNext, onPrevious]);

  if (!card) return null;

  return (
    <section className="deck" aria-label="Flashcard study deck">
      <div className="deck__intro">
        <h2 className="deck__title">{title}</h2>
        <p className="deck__description">{description}</p>
        {reviewMode ? (
          <button type="button" className="deck__back" onClick={onBackToSummary}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Summary
          </button>
        ) : null}
      </div>

      <p className="deck__counter">
        Card {currentIndex + 1} of {cards.length}
        {reviewMode ? " · Reviewing missed cards" : ""}
      </p>

      <Flashcard
        card={card}
        flipped={flipped}
        answer={answers[card.id]}
        onFlip={onFlip}
        onMark={(result) => onMark(card.id, result)}
      />

      <div className="deck__nav">
        <button
          type="button"
          className="deck__nav-btn"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          className="deck__nav-btn"
          onClick={onNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <ProgressBar completed={completed} total={cards.length} />
    </section>
  );
}

export default FlashcardDeck;
