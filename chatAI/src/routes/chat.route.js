import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";

const router = Router();

// POST /chat
router.post("/chat", handleChat);

export default router;
