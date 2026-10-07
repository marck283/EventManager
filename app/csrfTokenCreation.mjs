import { Router } from 'express';
const router = Router();
import { doubleCsrf } from 'csrf-csrf';

// Initialize double-csrf
const {
  doubleCsrfProtection, // Middleware to protect routes
  generateCsrfToken,    // Function to create a token
} = doubleCsrf({
  getSecret: () => {
    if (!process.env.SUPER_SECRET) {
      throw new Error("SUPER_SECRET is required for CSRF protection");
    }
    return process.env.SUPER_SECRET;
  },
  getSessionIdentifier: (req) => req.ip,
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: true,
  },
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

router.get('/', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  // Send the token to the frontend (e.g., via JSON or rendering into a template)
  res.json({ csrfToken });
});

export default router;