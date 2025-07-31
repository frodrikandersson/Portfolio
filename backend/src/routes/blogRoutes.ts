import express from 'express';
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  deleteBlogPost,
  updateBlogPost
} from '../controllers/blogController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

// Public routes
router.get('/public', getAllBlogPosts);
router.get('/public/:slug', getBlogPostBySlug);

// Private routes

// Admin routes
router.post('/admin', isAuthenticated, isAdmin, createBlogPost);
router.patch('/admin/update/:id', isAuthenticated, isAdmin, updateBlogPost);
router.delete('/admin/delete/:id', isAuthenticated, isAdmin, deleteBlogPost);

export default router;
