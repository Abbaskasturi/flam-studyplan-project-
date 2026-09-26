import { AppError } from "../middleware/errorHandler.js";
import { validateStudyResult } from "../validators/resultValidator.js";

const SYSTEM_PROMPT = `You generate study flashcards for a student revision app.
Return ONLY valid JSON. Do not return markdown. Do not return code fences.
Do not return explanations outside JSON.

Follow this exact schema:
{
  "title": "string",
  "description": "string",
  "cards": [
    {
      "id": "card-1",
      "question": "string",
      "answer": "string",
      "difficulty": "easy"
    }
  ]
}

Rules:
- title and description must be non-empty strings.
- Generate between 3 and 10 cards.
- Each card must contain id, question, answer, and difficulty.
- difficulty must be exactly one of: easy, medium, hard.
- Make questions educational and useful.
- Do not invent facts when the user's topic is ambiguous.
- If the topic is too vague, still produce general foundational cards.`;

function getConfig() {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 25000;

  return { apiKey, baseUrl, model, timeoutMs };
}

function extractJson(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new AppError("The AI returned an empty response.", 502, "EMPTY_AI_RESPONSE");
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new AppError(
        "The AI returned an invalid format.",
        502,
        "INVALID_AI_JSON"
      );
    }

    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      throw new AppError(
        "The AI returned an invalid format.",
        502,
        "INVALID_AI_JSON"
      );
    }
  }
}

function mapProviderStatus(status) {
  if (status === 429) {
    return new AppError("Too many requests. Please try again shortly.", 429, "RATE_LIMITED");
  }

  if (status === 408 || status === 504) {
    return new AppError("The request took too long. Please try again.", 408, "TIMEOUT");
  }

  return new AppError(
    "The study cards could not be generated.",
    502,
    "AI_PROVIDER_FAILURE"
  );
}

/**
 * Isolated LLM provider call. Swap base URL / model via env vars
 * without changing the rest of the backend.
 */
export async function generateStudySession(topic) {
  const { apiKey, baseUrl, model, timeoutMs } = getConfig();

  if (!apiKey || apiKey === "your_key_here") {
    throw new AppError(
      "The study service is not configured.",
      500,
      "MISSING_API_KEY"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create flashcards for this study input:\n\n${topic}`,
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError("The request took too long. Please try again.", 408, "TIMEOUT");
    }

    throw new AppError(
      "The study cards could not be generated.",
      502,
      "AI_PROVIDER_FAILURE"
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw mapProviderStatus(response.status);
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new AppError("The AI returned an invalid format.", 502, "INVALID_AI_JSON");
  }

  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new AppError("The AI returned an empty response.", 502, "EMPTY_AI_RESPONSE");
  }

  const parsed = extractJson(content);
  const validation = validateStudyResult(parsed);

  if (!validation.valid) {
    throw new AppError(validation.error, 502, "INVALID_AI_SHAPE");
  }

  return validation.data;
}
