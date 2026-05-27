import { Router } from "express";
import { destroy, index, show, stats, store, update } from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", index);
router.get("/stats", stats);
router.get("/:id", show);
router.post("/", store);
router.patch("/:id", update);
router.delete("/:id", destroy);

export default router;

