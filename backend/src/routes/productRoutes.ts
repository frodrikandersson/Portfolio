import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  createCheckoutSession,
  verifyPurchase,
  getMyPurchasedProductIds,
  getMyPurchases,
  downloadProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadCoverImage,
  adminGetAllProducts,
} from '../controllers/productController';
import { isAuthenticated } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { productUpload, coverUpload } from '../middlewares/productUpload';

const router = Router();

// Public routes
router.get('/public', getAllProducts);
router.get('/public/:slug', getProductBySlug);

// Authenticated routes
router.post('/purchase', isAuthenticated, createCheckoutSession);
router.post('/verify-purchase', isAuthenticated, verifyPurchase);
router.get('/my-purchased-ids', isAuthenticated, getMyPurchasedProductIds);
router.get('/my-purchases', isAuthenticated, getMyPurchases);
router.get('/download/:productId', isAuthenticated, downloadProduct);

// Admin routes
router.get('/admin', isAuthenticated, isAdmin, adminGetAllProducts);
router.post('/admin', isAuthenticated, isAdmin, productUpload.single('file'), createProduct);
router.patch('/admin/:id', isAuthenticated, isAdmin, productUpload.single('file'), updateProduct);
router.delete('/admin/:id', isAuthenticated, isAdmin, deleteProduct);
router.post('/admin/:id/cover', isAuthenticated, isAdmin, coverUpload.single('cover'), uploadCoverImage);

export default router;
