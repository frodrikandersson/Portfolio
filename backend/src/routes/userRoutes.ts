import express, { Request, Response } from 'express';
import { getAllUsers, getLoggedInUser, getOneUserById, loginUser, logoutUser, registerUser, updateUserRole } from '../controllers/userController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

// Set public routes
router.get('/public/', getAllUsers);
router.post('/public/login', loginUser);
router.post('/public/logout', logoutUser);
router.post('/public/register', registerUser);

// Set private routes
router.get('/private/:id', isAuthenticated, getOneUserById);
router.get('/private/me', isAuthenticated, getLoggedInUser);

// Admin routes
router.patch('/admin/:id/role', isAuthenticated, isAdmin, updateUserRole);

export default router;