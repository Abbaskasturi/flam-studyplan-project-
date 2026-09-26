import { Check, CircleHelp, RotateCcw, X } from "lucide-react";
import "./index.css";

function Flashcard({ card, flipped, onFlip, onMark, answer }) {
  const difficultyLabel = card.difficulty[0].toUpperCase() + card.difficulty.slice(1);
  const alreadyAnswered = Boolean(answer);

  return (
    <div className="flashcard-wrap">
      <button
        type="button"
        className={`flashcard${flipped ? " flashcard--flipped" : ""}`}
        onClick={onFlip}
        aria-pressed={flipped}
        aria-label={flipped ? "Hide answer" : "Show answer"}
      >
        <span className={`flashcard__badge flashcard__badge--${card.difficulty}`}>
          {difficultyLabel}
        </span>
        <span className="flashcard__face flashcard__face--front">
          <span className="flashcard__kicker">
            <CircleHelp size={16} aria-hidden="true" />
            Question
          </span>
          <span className="flashcard__text">{card.question}</span>
        </span>
        <span className="flashcard__face flashcard__face--back">
          <span className="flashcard__kicker">Answer</span>
          <span className="flashcard__text">{card.answer}</span>
        </span>
      </button>

      <div className="flashcard__actions">
        {!flipped ? (
          <button type="button" className="flashcard__show" onClick={onFlip}>
            Show Answer
          </button>
        ) : (
          <div className="flashcard__feedback">
            {alreadyAnswered ? (
              <p className="flashcard__recorded" aria-live="polite">
                {answer === "correct" ? (
                  <>
                    <Check size={16} aria-hidden="true" /> Marked as known
                  </>
                ) : (
                  <>
                    <X size={16} aria-hidden="true" /> Marked as incorrect
                  </>
                )}
              </p>
            ) : (
              <>
                <p className="flashcard__prompt">Did you know this?</p>
                <div className="flashcard__choices">
                  <button
                    type="button"
                    className="flashcard__choice flashcard__choice--yes"
                    onClick={() => onMark("correct")}
                  >
                    <Check size={16} aria-hidden="true" /> I knew it
                  </button>
                  <button
                    type="button"
                    className="flashcard__choice flashcard__choice--no"
                    onClick={() => onMark("incorrect")}
                  >
                    <X size={16} aria-hidden="true" /> I got it wrong
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Flashcard;
