import { Router } from "express";
import { sendMessage } from "../controllers/chatController.js";
import { protectAPI } from "../middleware/auth.js";

const router = Router();

/**
 * Chat Routes
 * 
 * POST /api/chat  - Protected: send a message to the DSA Instructor AI
 */

// Protected route - only authenticated users can chat
router.post("/", protectAPI, sendMessage);

export default router;
