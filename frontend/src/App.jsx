import { useCallback, useRef, useState } from "react";
import Header from "./components/Header";
import PromptInput from "./components/PromptInput";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import FlashcardDeck from "./components/FlashcardDeck";
import ResultSummary from "./components/ResultSummary";
import { generateStudySession } from "./lib/api";
import { validateResult } from "./lib/validateResult";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [mode, setMode] = useState("study");
  const [reviewCards, setReviewCards] = useState([]);
  const [forceSummary, setForceSummary] = useState(false);

  // requestId ignores slower, older responses after a newer generate starts.
  // AbortController cancels the previous fetch so it does not finish in the
  // background and is not shown as an error.
  const requestId = useRef(0);
  const abortRef = useRef(null);

  const activeCards = mode === "review" ? reviewCards : session?.cards || [];
  const completedCount = activeCards.filter((card) => answers[card.id]).length;
  const allActiveAnswered =
    status === "success" && activeCards.length > 0 && completedCount === activeCards.length;
  const sessionComplete = forceSummary || allActiveAnswered;

  const generate = useCallback(async (rawInput) => {
    const topic = (rawInput ?? "").trim();
    if (!topic) return;

    // Cancel in-flight work so two quick clicks do not race.
    if (abortRef.current) {
      abortRef.current.abort("replaced");
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestId.current;

    setStatus("loading");
    setError(null);
    setSession(null);
    setAnswers({});
    setCurrentIndex(0);
    setFlipped(false);
    setMode("study");
    setReviewCards([]);
    setForceSummary(false);

    try {
      const payload = await generateStudySession(topic, { signal: controller.signal });

      // If the user started a newer request, drop this result.
      if (id !== requestId.current) return;

      const validation = validateResult(payload);
      if (!validation.valid) {
        setError({
          title: "Something went wrong while generating your cards.",
          detail: "The AI returned data we couldn't safely use.",
        });
        setStatus("error");
        return;
      }

      setSession(validation.data);
      setStatus("success");
    } catch (caught) {
      if (caught.code === "ABORTED" || id !== requestId.current) {
        return;
      }

      if (import.meta.env.DEV) {
        console.error(caught);
      }

      setError({
        title: caught.title || "Something went wrong while generating your cards.",
        detail: caught.detail || "Please try again.",
      });
      setStatus("error");
    }
  }, []);

  function handleFlip() {
    setFlipped((current) => !current);
  }

  function handleMark(cardId, result) {
    setAnswers((current) => {
      if (current[cardId]) return current;
      return { ...current, [cardId]: result };
    });
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setFlipped(false);
  }

  function handleNext() {
    setCurrentIndex((index) => Math.min(activeCards.length - 1, index + 1));
    setFlipped(false);
  }

  function handleReviewWrong() {
    const missed = (session?.cards || []).filter((card) => answers[card.id] === "incorrect");
    if (missed.length === 0) return;

    setAnswers((current) => {
      const next = { ...current };
      missed.forEach((card) => {
        delete next[card.id];
      });
      return next;
    });
    setReviewCards(missed);
    setMode("review");
    setForceSummary(false);
    setCurrentIndex(0);
    setFlipped(false);
  }

  function handleBackToSummary() {
    setAnswers((current) => {
      const next = { ...current };
      reviewCards.forEach((card) => {
        if (!next[card.id]) next[card.id] = "incorrect";
      });
      return next;
    });
    setMode("study");
    setForceSummary(true);
  }

  function handleNewSession() {
    if (abortRef.current) {
      abortRef.current.abort("replaced");
    }
    requestId.current += 1;
    setInput("");
    setStatus("idle");
    setSession(null);
    setError(null);
    setCurrentIndex(0);
    setFlipped(false);
    setAnswers({});
    setMode("study");
    setReviewCards([]);
    setForceSummary(false);
  }

  const allCards = session?.cards || [];
  const correct = allCards.filter((card) => answers[card.id] === "correct").length;
  const incorrect = allCards.filter((card) => answers[card.id] === "incorrect").length;

  return (
    <div className="app">
      <Header />
      <main>
        <PromptInput
          value={input}
          onChange={setInput}
          onSubmit={() => generate(input)}
          loading={status === "loading"}
        />

        {status === "idle" ? <EmptyState onSelectTopic={setInput} /> : null}
        {status === "loading" ? <LoadingState /> : null}
        {status === "error" ? (
          <ErrorState
            title={error?.title}
            detail={error?.detail}
            onRetry={() => generate(input)}
          />
        ) : null}

        {status === "success" && session && !sessionComplete ? (
          <FlashcardDeck
            title={session.title}
            description={session.description}
            cards={activeCards}
            currentIndex={currentIndex}
            flipped={flipped}
            answers={answers}
            onFlip={handleFlip}
            onMark={handleMark}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onBackToSummary={handleBackToSummary}
            reviewMode={mode === "review"}
          />
        ) : null}

        {status === "success" && sessionComplete ? (
          <ResultSummary
            total={allCards.length}
            correct={correct}
            incorrect={incorrect}
            reviewAvailable={incorrect > 0}
            onReviewWrong={handleReviewWrong}
            onNewSession={handleNewSession}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
