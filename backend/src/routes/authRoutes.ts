import express from 'express';
import { googleTokenAuth } from '../controllers/authController';
// import { isAuthenticated } from '../middlewares/auth';
// import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

// Set public routes
router.post('/public/google-login', googleTokenAuth);

// Set private routes
// router.get('/private/me', isAuthenticated, getLoggedInUser);

// Admin routes
// router.patch('/admin/:id/role', isAuthenticated, isAdmin, updateUserRole);

export default router;