export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(err, req, res, next) {
  void next;

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("[error]", err.message);
  }

  const safeMessages = {
    400: "The study input looks invalid. Please check it and try again.",
    408: "The request took too long. Please try again.",
    429: "Too many requests. Please wait a moment and try again.",
    502: "The study cards could not be generated safely. Please try again.",
    500: "Something went wrong on the server. Please try again.",
  };

  const message =
    err instanceof AppError && err.message
      ? err.message
      : safeMessages[statusCode] || safeMessages[500];

  res.status(statusCode).json({
    error: err.code || "REQUEST_FAILED",
    message,
  });
}
