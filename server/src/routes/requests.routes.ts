import { Router } from "express";
import { requestsController } from "../controllers/requests.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public
router.get("/", requestsController.getAll);
router.get("/:id", requestsController.getById);

// Protected
router.post("/", authMiddleware, requestsController.create);
router.put("/:id", authMiddleware, requestsController.update);
router.delete("/:id", authMiddleware, requestsController.remove);

export default router;
