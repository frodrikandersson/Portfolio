import express from 'express';
import { getAllSessions, getOneSession } from '../controllers/sessionController';

const router = express.Router();

router.get('/', getAllSessions);
router.get('/:sessionToken', getOneSession);

export default router;