import express from 'express';
import {
  getAllMedia,
  getMediaById,
  uploadMedia,
  updateMedia,
  deleteMedia,
  getMediaUsage,
  linkMediaToEntity,
  syncExistingMedia,
} from '../controllers/mediaController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { mediaUpload } from '../middlewares/imageUpload';

const router = express.Router();

// Admin routes
router.get('/admin', isAuthenticated, isAdmin, getAllMedia);
router.get('/admin/:id', isAuthenticated, isAdmin, getMediaById);
router.post('/admin/upload', isAuthenticated, isAdmin, mediaUpload.single('file'), uploadMedia);
router.patch('/admin/:id', isAuthenticated, isAdmin, updateMedia);
router.delete('/admin/:id', isAuthenticated, isAdmin, deleteMedia);
router.get('/admin/:id/usage', isAuthenticated, isAdmin, getMediaUsage);
router.post('/admin/:id/link', isAuthenticated, isAdmin, linkMediaToEntity);
router.post('/admin/sync', isAuthenticated, isAdmin, syncExistingMedia);

export default router;
