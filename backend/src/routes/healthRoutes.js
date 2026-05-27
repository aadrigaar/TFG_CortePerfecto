import { Router } from "express";
import { health, lmStudioHealth } from "../controllers/healthController.js";

const router = Router();

router.get("/", health);
router.get("/lmstudio", lmStudioHealth);

export default router;

