import { Send } from "lucide-react";
import "./index.css";

const MAX_LENGTH = 2000;
const MIN_LENGTH = 3;

function PromptInput({ value, onChange, onSubmit, loading }) {
  const length = value.length;
  const isEmpty = value.trim().length === 0;
  const tooShort = !isEmpty && value.trim().length < MIN_LENGTH;
  const tooLong = length > MAX_LENGTH;
  const canSubmit = !loading && !isEmpty && !tooShort && !tooLong;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  let helperMessage = "Enter a topic or paste notes to generate flashcards.";
  if (tooShort) helperMessage = "Please enter at least 3 characters.";
  if (tooLong) helperMessage = `Please keep your input under ${MAX_LENGTH} characters.`;

  return (
    <form className="prompt-input" onSubmit={handleSubmit}>
      <label className="prompt-input__label" htmlFor="study-input">
        What do you want to study?
      </label>
      <textarea
        id="study-input"
        className="prompt-input__field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your notes or enter a topic you'd like to study..."
        rows={6}
        aria-describedby="study-input-help study-input-count"
        aria-invalid={tooLong || tooShort}
        disabled={loading}
      />
      <div className="prompt-input__meta">
        <p
          id="study-input-help"
          className={`prompt-input__help${tooLong || tooShort ? " prompt-input__help--error" : ""}`}
        >
          {helperMessage}
        </p>
        <p id="study-input-count" className="prompt-input__count">
          {length} / {MAX_LENGTH}
        </p>
      </div>
      <button className="prompt-input__submit" type="submit" disabled={!canSubmit}>
        <Send size={16} aria-hidden="true" />
        Generate Study Cards
      </button>
    </form>
  );
}

export default PromptInput;
