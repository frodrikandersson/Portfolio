import express from 'express';
import rateLimit from 'express-rate-limit';
import { googleTokenAuth } from '../controllers/authController';
// import { isAuthenticated } from '../middlewares/auth';
// import { isAdmin } from '../middlewares/isAdmin';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Set public routes
router.post('/public/google-login', authLimiter, googleTokenAuth);

// Set private routes
// router.get('/private/me', isAuthenticated, getLoggedInUser);

// Admin routes
// router.patch('/admin/:id/role', isAuthenticated, isAdmin, updateUserRole);

export default router;