import { Router } from 'express';
const router = Router();
import { doubleCsrf } from 'csrf-csrf';

// Initialize double-csrf
const {
  doubleCsrfProtection, // Middleware to protect routes
  generateCsrfToken,    // Function to create a token
} = doubleCsrf({
  getSecret: (req) => req.secret, // Use the secret from cookie-parser
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: true,
  },
  getTokenFromRequest: (req) => req.headers["x-csrf-token"], // Where to look for the token in requests
});

router.get('/', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  // Send the token to the frontend (e.g., via JSON or rendering into a template)
  res.json({ csrfToken });
});

export default router;