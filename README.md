# StudyFlow AI

Turn any topic, notes, or study material into an interactive flashcard session.

StudyFlow AI is a small full-stack product for a frontend internship assignment. A user types free-form study input. A Node.js backend asks a real LLM for structured JSON. Both the backend and the React app validate that JSON before any flashcards are shown. The UI is a study deck, not a chatbot.

## Overview

You enter something like `JavaScript promises and async/await`. The app generates a short set of flashcards, lets you flip them, mark whether you knew the answer, track progress, and retest the cards you got wrong.

## Features

- Free-form study input
- AI-generated structured flashcards
- JSON parsing and validation on the backend and frontend
- Interactive flashcards with flip and keyboard support
- Progress tracking
- Correct / incorrect tracking
- Wrong-answer retesting
- Loading, empty, and error states
- Retry
- Timeout handling
- Stale request protection and request cancellation
- Responsive, mobile-first UI
- API key kept only on the backend

## Architecture

```text
React (form + study UI)
  → Express POST /api/generate
  → LLM (JSON flashcards)
  → Parse
  → Validate
  → React state
  → Interactive flashcards
```

The browser never talks to the LLM provider. `frontend/src/lib/api.js` is the only frontend file that calls the backend.

## Project Structure

```text
flam-assessment/
  backend/
    controllers/generateController.js
    middleware/errorHandler.js
    routes/generateRoutes.js
    services/aiService.js
    validators/resultValidator.js
    server.js
  frontend/
    src/
      components/   (each feature has index.jsx + index.css)
      lib/api.js
      lib/validateResult.js
      App.jsx
```

## Setup

You need Node.js 18+ (for native `fetch`).

```bash
cd backend
copy .env.example .env
# then edit backend/.env and set LLM_API_KEY

npm install
node server.js
```

In a second terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

From the repo root you can also run:

```bash
npm run install:all
node server.js:backend
npm run dev:frontend
```

Open the Vite URL, usually `http://localhost:5173`.

The default LLM setup uses Gemini via Google's OpenAI-compatible endpoint. You can point the same service at Groq, OpenAI, or another compatible provider by changing `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default `5000` |
| `FRONTEND_ORIGIN` | Comma-separated CORS origins. Include the Vercel URL, e.g. `https://flam-studyplan.vercel.app,http://localhost:5173` |
| `LLM_API_KEY` | Secret provider key. Never put this in frontend code. |
| `LLM_BASE_URL` | OpenAI-compatible base URL |
| `LLM_MODEL` | Model name |
| `LLM_TIMEOUT_MS` | Provider timeout, default `25000` |

### Frontend (`frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` or `VITE_API_BASE_URL` | Backend origin, e.g. `https://flam-studyplan-project.onrender.com`. Must be set **before** a Vercel build. Do not include `/api/generate`. |

Do not prefix the LLM key with `VITE_`. Vite exposes `VITE_*` values to the browser.

## API

`POST /api/generate`

Request:

```json
{
  "input": "JavaScript promises"
}
```

Success (`200`):

```json
{
  "title": "JavaScript Promises",
  "description": "Key concepts for revision",
  "cards": [
    {
      "id": "card-1",
      "question": "What is a Promise?",
      "answer": "A Promise represents the eventual completion or failure of an asynchronous operation.",
      "difficulty": "easy"
    }
  ]
}
```

Input rules: `input` must be a non-empty string, at least 3 characters after trim, and at most 2000 characters.

Possible errors:

| Status | Meaning |
| --- | --- |
| `400` | Invalid user input |
| `408` | Request timed out |
| `429` | Rate limited |
| `502` | Provider failure, empty response, malformed JSON, or invalid shape |
| `500` | Unexpected server error |

The UI shows human-friendly messages for these cases. It does not show stack traces, provider payloads, or API keys.

## Failure Handling

- **Malformed JSON:** the backend treats non-JSON model text as a controlled `502`.
- **Wrong shape:** missing `title`, empty `cards`, or incomplete card objects fail validation.
- **Empty response:** controlled error, nothing is rendered as flashcards.
- **Timeout:** frontend aborts after about 25 seconds and offers retry.
- **Provider failure:** mapped to a safe HTTP error.
- **Stale response:** `requestId` plus `AbortController` drop older results when a newer generate starts. An aborted previous request is not shown as an error.

## AI Usage Note

AI tools were used for brainstorming, debugging assistance, reviewing implementation approaches, and generating some initial code suggestions. The final implementation was reviewed, tested, modified, and understood by the author.

## Known Limitations

- Card quality depends on the model and the clarity of the user's notes.
- There is no account system, history, or saved decks.
- The app generates 3–10 cards per request, not a full textbook.
- A valid Gemini (or other OpenAI-compatible) API key is required for generation.
- CORS is intentionally limited to `FRONTEND_ORIGIN`, so production deploys must update that value.

## Time Spent

Approximately ___ hours.
2 hours 
