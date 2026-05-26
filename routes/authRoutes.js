import { Router } from "express";
import { register, login, getCurrentUser, refreshToken } from "../controllers/authController.js";
import { protectAPI } from "../middleware/auth.js";

const router = Router();

/**
 * Auth Routes
 * 
 * POST /api/auth/register   - Public: create new user account
 * POST /api/auth/login      - Public: authenticate user and get JWT
 * POST /api/auth/refresh    - Public: refresh JWT token
 * GET  /api/auth/me         - Protected: get current user profile
 */

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", protectAPI, getCurrentUser);

export default router;
