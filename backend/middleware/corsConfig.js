import dotenv from "dotenv";

dotenv.config();

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://flam-studyplan.vercel.app",
  "https://flam-studyplan-project.vercel.app",
];

function parseOrigins(value) {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const allowedOrigins = new Set([
  ...DEFAULT_ORIGINS,
  ...parseOrigins(process.env.FRONTEND_ORIGIN),
  ...parseOrigins(process.env.FRONTEND_ORIGINS),
]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
}

export function corsOptions() {
  return {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  };
}
