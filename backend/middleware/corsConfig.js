import dotenv from "dotenv";

dotenv.config();

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export function corsOptions() {
  return {
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  };
}
