import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { getCollection } from '../config/db';
import { IUser } from '../interfaces/UserInterface';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// Stripe Price IDs - configure these in your Stripe dashboard
const PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || '',
};

export const getSubscriptionPrices = async (_req: Request, res: Response) => {
  try {
    const [monthlyPrice, yearlyPrice] = await Promise.all([
      stripe.prices.retrieve(PRICE_IDS.monthly, { expand: ['product'] }),
      stripe.prices.retrieve(PRICE_IDS.yearly, { expand: ['product'] }),
    ]);

    const formatPrice = (price: Stripe.Price) => ({
      id: price.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval || null,
      intervalCount: price.recurring?.interval_count || 1,
      productName: typeof price.product === 'object' && 'name' in price.product
        ? price.product.name : null,
    });

    res.json({
      monthly: formatPrice(monthlyPrice),
      yearly: formatPrice(yearlyPrice),
    });
  } catch (err) {
    console.error('Error fetching subscription prices:', err);
    res.status(500).json({ message: 'Failed to fetch prices' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  const user = req.user;
  const { plan } = req.body;

  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }
  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    res.status(400).json({ message: 'Plan must be "monthly" or "yearly"' }); return;
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    res.status(500).json({ message: 'Subscription plan not configured' }); return;
  }

  try {
    // Check if user already has active subscription
    if (user.subscriptionStatus === 'active') {
      res.status(409).json({ message: 'Already subscribed' }); return;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.stripeCustomerId ? undefined : user.email,
      customer: user.stripeCustomerId || undefined,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${env.FRONTEND_URL}?subscription=success`,
      cancel_url: `${env.FRONTEND_URL}?subscription=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }

  try {
    const userCol = await getCollection<IUser>('users');
    const dbUser = await userCol.findOne({ _id: new ObjectId(user._id.toString()) });

    if (!dbUser) { res.status(404).json({ message: 'User not found' }); return; }

    // If DB already shows active, return it
    if (dbUser.subscriptionStatus === 'active') {
      res.json({
        subscriptionStatus: 'active',
        subscriptionPlan: dbUser.subscriptionPlan || null,
        subscriptionExpiresAt: dbUser.subscriptionExpiresAt || null,
      });
      return;
    }

    // Otherwise, check Stripe directly (handles missed webhooks)
    let customerId = dbUser.stripeCustomerId;

    // If no customer ID stored, look up by email
    if (!customerId && dbUser.email) {
      const customers = await stripe.customers.list({ email: dbUser.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        const priceId = sub.items.data[0]?.price?.id;
        const plan = priceId === PRICE_IDS.monthly ? 'monthly'
          : priceId === PRICE_IDS.yearly ? 'yearly'
          : 'monthly';
        const periodEnd = (sub as unknown as Record<string, number>).current_period_end;
        const expiresAt = periodEnd ? new Date(periodEnd * 1000) : null;

        // Sync DB with Stripe (self-heal)
        await userCol.updateOne(
          { _id: new ObjectId(user._id.toString()) },
          {
            $set: {
              stripeCustomerId: customerId,
              subscriptionStatus: 'active',
              subscriptionPlan: plan,
              subscriptionExpiresAt: expiresAt,
              updatedAt: new Date(),
            },
          }
        );

        res.json({
          subscriptionStatus: 'active',
          subscriptionPlan: plan,
          subscriptionExpiresAt: expiresAt,
        });
        return;
      }
    }

    // No active subscription found
    res.json({
      subscriptionStatus: dbUser.subscriptionStatus || 'none',
      subscriptionPlan: dbUser.subscriptionPlan || null,
      subscriptionExpiresAt: dbUser.subscriptionExpiresAt || null,
    });
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    res.status(500).json({ message: 'Failed to fetch subscription status' });
  }
};

export const createCustomerPortal = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }

  if (!user.stripeCustomerId) {
    res.status(400).json({ message: 'No subscription found' }); return;
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: env.FRONTEND_URL,
    });

    res.json({ portalUrl: portalSession.url });
  } catch (err) {
    console.error('Error creating customer portal:', err);
    res.status(500).json({ message: 'Failed to create portal session' });
  }
};
