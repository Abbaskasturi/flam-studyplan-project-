import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoutes from "./routes/generateRoutes.js";
import { corsOptions } from "./middleware/corsConfig.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors(corsOptions()));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", generateRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "That endpoint does not exist.",
  });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`StudyFlow AI backend running on http://localhost:${port}`);
});
