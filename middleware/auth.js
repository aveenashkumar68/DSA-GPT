import { verifyToken, extractToken } from "../utils/jwt.js";

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from request headers
 */

/**
 * Protect API Middleware
 * Use this on API routes that require authentication.
 * Extracts JWT from Authorization header and verifies it.
 */
export const protectAPI = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Please provide a valid JWT token." });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed." });
  }
};

/**
 * Optional Auth Middleware
 * Attaches user info to request if token is valid, but doesn't block.
 * Useful for routes that work for both guests and authenticated users.
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Don't block, continue without auth info
  }
};

