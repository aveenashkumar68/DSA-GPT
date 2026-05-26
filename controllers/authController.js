import User from "../models/User.js";
import { generateToken, verifyToken, extractToken } from "../utils/jwt.js";

/**
 * Auth Controller
 * Handles authentication-related API endpoints (register, login, get current user)
 */

/**
 * POST /api/auth/register
 * Create a new user account with email and password
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Create new user
    const newUser = new User({
      firstName: firstName || "User",
      lastName: lastName || "",
      email: email.toLowerCase(),
      password,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    res.json({
      message: "Login successful.",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login." });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile info
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh JWT token (for token rotation)
 */
export const refreshToken = async (req, res) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ error: "No token provided." });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // Generate new token
    const newToken = generateToken(decoded.userId, decoded.email);

    res.json({ token: newToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token." });
  }
};
