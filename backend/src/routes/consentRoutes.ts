import express from 'express';
import {
    getUserConsents,
    createUserConsent,
} from '../controllers/consentController';
import { isAuthenticated } from '../middlewares/auth';

const router = express.Router();

// Public routes

// Private routes
router.get('/private/:id', isAuthenticated, getUserConsents);
router.post('/private/register', isAuthenticated, createUserConsent);

// Admin routes

export default router;
