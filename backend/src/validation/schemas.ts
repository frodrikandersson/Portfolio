import { z } from 'zod';

// User schemas
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(254),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  picture: z.string().max(500000).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user'], { message: 'Role must be "admin" or "user"' }),
});

// Blog schemas
export const createBlogPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(100000),
  slug: z.string().min(1, 'Slug is required').max(200),
  excerpt: z.string().max(500).optional().default(''),
  coverImage: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().trim().max(50).optional().default(''),
  isPublished: z.boolean().optional().default(false),
  commentsEnabled: z.boolean().optional().default(true),
});

export const updateBlogPostSchema = createBlogPostSchema;

// Consent schemas
export const consentSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  dataSharing: z.boolean(),
});

// Product schemas (for non-multipart fields validated after multer)
export const checkoutSessionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

// Subscription schemas
export const subscriptionCheckoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly'], { message: 'Plan must be "monthly" or "yearly"' }),
});

// Param schemas
export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});
