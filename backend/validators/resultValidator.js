const ALLOWED_DIFFICULTY = ["easy", "medium", "hard"];
const MIN_CARDS = 3;
const MAX_CARDS = 10;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Never trust the model output. Validate the full shape before sending
 * anything to the frontend.
 */
export function validateStudyResult(result) {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    return { valid: false, error: "The AI returned an invalid format." };
  }

  if (!isNonEmptyString(result.title)) {
    return { valid: false, error: "The generated session is missing a title." };
  }

  if (!isNonEmptyString(result.description)) {
    return {
      valid: false,
      error: "The generated session is missing a description.",
    };
  }

  if (!Array.isArray(result.cards)) {
    return { valid: false, error: "The generated cards have an invalid structure." };
  }

  if (result.cards.length < MIN_CARDS || result.cards.length > MAX_CARDS) {
    return {
      valid: false,
      error: "The generated session does not contain a usable number of cards.",
    };
  }

  for (let i = 0; i < result.cards.length; i += 1) {
    const card = result.cards[i];

    if (card == null || typeof card !== "object" || Array.isArray(card)) {
      return { valid: false, error: "The generated cards have an invalid structure." };
    }

    if (!isNonEmptyString(card.id)) {
      return { valid: false, error: "The generated cards have an invalid structure." };
    }

    if (!isNonEmptyString(card.question)) {
      return { valid: false, error: "The generated cards have an invalid structure." };
    }

    if (!isNonEmptyString(card.answer)) {
      return { valid: false, error: "The generated cards have an invalid structure." };
    }

    if (!ALLOWED_DIFFICULTY.includes(card.difficulty)) {
      return { valid: false, error: "The generated cards have an invalid structure." };
    }
  }

  return {
    valid: true,
    data: {
      title: result.title.trim(),
      description: result.description.trim(),
      cards: result.cards.map((card) => ({
        id: String(card.id).trim(),
        question: card.question.trim(),
        answer: card.answer.trim(),
        difficulty: card.difficulty,
      })),
    },
  };
}
