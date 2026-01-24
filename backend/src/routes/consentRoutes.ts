import express from 'express';
import {
    getUserConsents,
    createUserConsent,
} from '../controllers/consentController';
import { isAuthenticated } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { consentSchema } from '../validation/schemas';

const router = express.Router();

// Public routes

// Private routes
router.get('/private/:id', isAuthenticated, getUserConsents);
router.post('/private/register', isAuthenticated, validate(consentSchema), createUserConsent);

// Admin routes

export default router;
