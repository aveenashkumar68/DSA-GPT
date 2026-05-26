import jwt from "jsonwebtoken";

/**
 * JWT Utilities
 * Handles token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d"; // Token expires in 7 days

/**
 * Generate a JWT token
 * @param {string} userId - User ID from MongoDB
 * @param {string} email - User email
 * @returns {string} JWT token
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};

/**
 * Extract token from request headers
 * @param {object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};
