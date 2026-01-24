import { Router } from 'express';
import {
  getSubscriptionPrices,
  createSubscription,
  getSubscriptionStatus,
  createCustomerPortal,
} from '../controllers/subscriptionController';
import { isAuthenticated } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { subscriptionCheckoutSchema } from '../validation/schemas';

const router = Router();

router.get('/prices', getSubscriptionPrices);
router.post('/checkout', isAuthenticated, validate(subscriptionCheckoutSchema), createSubscription);
router.get('/status', isAuthenticated, getSubscriptionStatus);
router.post('/portal', isAuthenticated, createCustomerPortal);

export default router;
