const REQUEST_TIMEOUT_MS = 45000;

const STATUS_MESSAGES = {
  400: {
    title: "That study input could not be used.",
    detail: "Please check the length and try again with a clearer topic or notes.",
  },
  408: {
    title: "The request took too long. Please try again.",
    detail: "The backend did not finish generating cards in time.",
  },
  429: {
    title: "Too many requests right now.",
    detail: "Please wait a moment and try again.",
  },
  500: {
    title: "Something went wrong while generating your cards.",
    detail: "Please try again in a moment.",
  },
  502: {
    title: "Something went wrong while generating your cards.",
    detail: "The AI returned data we couldn't safely use.",
  },
};

function getBaseUrl() {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://flam-studyplan-project.onrender.com";

  return String(raw)
    .trim()
    .replace(/\/$/, "")
    .replace(/\/api\/generate$/i, "")
    .replace(/\/api$/i, "");
}

function createTimeoutError() {
  const error = new Error("The request took too long. Please try again.");
  error.code = "TIMEOUT";
  error.title = "The request took too long. Please try again.";
  error.detail = "You can retry without losing your study topic.";
  return error;
}

function createUserError(title, detail, code = "REQUEST_FAILED") {
  const error = new Error(title);
  error.code = code;
  error.title = title;
  error.detail = detail;
  return error;
}

/**
 * The only frontend file that talks to the backend.
 * The browser never calls the LLM provider directly.
 */
export async function generateStudySession(input, { signal } = {}) {
  const topic = input;
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(`${getBaseUrl()}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, input: topic }),
      signal: controller.signal,
    });

    let payload = null;

    try {
      payload = await response.json();
    } catch {
      throw createUserError(
        "Something went wrong while generating your cards.",
        "The server returned a response we could not read.",
        "INVALID_JSON"
      );
    }

    if (!response.ok) {
      const mapped = STATUS_MESSAGES[response.status] || STATUS_MESSAGES[500];
      throw createUserError(
        payload?.message || mapped.title,
        mapped.detail,
        payload?.error || `HTTP_${response.status}`
      );
    }

    return payload;
  } catch (error) {
    if (error.code && error.title) {
      throw error;
    }

    if (error.name === "AbortError") {
      if (didTimeout) {
        throw createTimeoutError();
      }

      const abortError = new Error("Request cancelled");
      abortError.code = "ABORTED";
      throw abortError;
    }

    throw createUserError(
      "Something went wrong while generating your cards.",
      "The app could not reach the study server. Check that the backend is running.",
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
