import express from 'express';
import rateLimit from 'express-rate-limit';
import { getAllUsers, getLoggedInUser, getOneUserById, loginUser, logoutUser, registerUser, updateUserRole, updateUserProfile } from '../controllers/userController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema, updateProfileSchema, updateRoleSchema } from '../validation/schemas';
// import { upload } from '../middlewares/upload';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Set public routes
router.get('/public/', getAllUsers);
router.post('/public/login', authLimiter, validate(loginSchema), loginUser);
router.post('/public/logout', logoutUser);
router.post('/public/register', authLimiter, validate(registerSchema), registerUser);

// Set private routes
router.get('/private/me', isAuthenticated, getLoggedInUser);
router.get('/private/:id', isAuthenticated, getOneUserById);
router.patch('/private/update', isAuthenticated, validate(updateProfileSchema), updateUserProfile);

// Admin routes
router.patch('/admin/:id/role', isAuthenticated, isAdmin, validate(updateRoleSchema), updateUserRole);

export default router;