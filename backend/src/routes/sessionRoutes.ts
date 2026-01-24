import express from 'express';
import { getAllSessions, getOneSession } from '../controllers/sessionController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

router.get('/', isAuthenticated, isAdmin, getAllSessions);
router.get('/:sessionToken', isAuthenticated, isAdmin, getOneSession);

export default router;
