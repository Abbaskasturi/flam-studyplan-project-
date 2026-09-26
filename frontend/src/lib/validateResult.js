const ALLOWED_DIFFICULTY = ["easy", "medium", "hard"];
const MIN_CARDS = 3;
const MAX_CARDS = 10;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Frontend validation is a second safety net.
 * Even if the backend already checked the payload, we never render
 * flashcards from an unexpected shape.
 */
export function validateResult(result) {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    return {
      valid: false,
      error: "The generated cards have an invalid structure.",
    };
  }

  if (!isNonEmptyString(result.title)) {
    return {
      valid: false,
      error: "The generated cards have an invalid structure.",
    };
  }

  if (!isNonEmptyString(result.description)) {
    return {
      valid: false,
      error: "The generated cards have an invalid structure.",
    };
  }

  if (!Array.isArray(result.cards)) {
    return {
      valid: false,
      error: "The generated cards have an invalid structure.",
    };
  }

  if (result.cards.length < MIN_CARDS || result.cards.length > MAX_CARDS) {
    return {
      valid: false,
      error: "The generated cards have an invalid structure.",
    };
  }

  for (const card of result.cards) {
    if (card == null || typeof card !== "object" || Array.isArray(card)) {
      return {
        valid: false,
        error: "The generated cards have an invalid structure.",
      };
    }

    if (!isNonEmptyString(card.id)) {
      return {
        valid: false,
        error: "The generated cards have an invalid structure.",
      };
    }

    if (!isNonEmptyString(card.question)) {
      return {
        valid: false,
        error: "The generated cards have an invalid structure.",
      };
    }

    if (!isNonEmptyString(card.answer)) {
      return {
        valid: false,
        error: "The generated cards have an invalid structure.",
      };
    }

    if (!ALLOWED_DIFFICULTY.includes(card.difficulty)) {
      return {
        valid: false,
        error: "The generated cards have an invalid structure.",
      };
    }
  }

  return { valid: true, data: result };
}
