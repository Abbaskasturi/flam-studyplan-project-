import { AppError } from "../middleware/errorHandler.js";
import { generateStudySession } from "../services/aiService.js";

const MAX_INPUT_LENGTH = 2000;

export async function generateController(req, res, next) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      throw new AppError("Please provide study input.", 400, "INVALID_BODY");
    }

    const { input } = body;

    if (input === undefined || input === null) {
      throw new AppError("Please provide study input.", 400, "INVALID_BODY");
    }

    if (typeof input !== "string") {
      throw new AppError("Study input must be text.", 400, "INVALID_INPUT");
    }

    const trimmed = input.trim();

    if (!trimmed) {
      throw new AppError("Please enter a topic or some notes.", 400, "EMPTY_INPUT");
    }

    if (trimmed.length < 3) {
      throw new AppError(
        "Please enter a slightly longer topic so useful cards can be created.",
        400,
        "INPUT_TOO_SHORT"
      );
    }

    if (input.length > MAX_INPUT_LENGTH) {
      throw new AppError(
        `Please keep your input under ${MAX_INPUT_LENGTH} characters.`,
        400,
        "INPUT_TOO_LONG"
      );
    }

    const result = await generateStudySession(trimmed);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
