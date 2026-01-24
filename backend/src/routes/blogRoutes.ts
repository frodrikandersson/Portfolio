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
import { validate } from '../middlewares/validate';
import { createBlogPostSchema, updateBlogPostSchema, objectIdParamSchema } from '../validation/schemas';

const router = express.Router();

// Public routes
router.get('/public', getAllBlogPosts);
router.get('/public/:slug', getBlogPostBySlug);

// Private routes

// Admin routes
router.post('/admin', isAuthenticated, isAdmin, validate(createBlogPostSchema), createBlogPost);
router.patch('/admin/update/:id', isAuthenticated, isAdmin, validate(objectIdParamSchema, 'params'), validate(updateBlogPostSchema), updateBlogPost);
router.delete('/admin/delete/:id', isAuthenticated, isAdmin, validate(objectIdParamSchema, 'params'), deleteBlogPost);

export default router;
