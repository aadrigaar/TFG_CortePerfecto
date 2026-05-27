import { Router } from "express";
import { index } from "../controllers/serviceController.js";

const router = Router();

router.get("/", index);

export default router;

