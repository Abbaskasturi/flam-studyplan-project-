import { Router } from "express";
import { generateController } from "../controllers/generateController.js";

const router = Router();

router.post("/generate", generateController);

export default router;
