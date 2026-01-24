import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { getCollection } from '../config/db';
import { IPurchase } from '../interfaces/PurchaseInterface';
import { IUser } from '../interfaces/UserInterface';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ message: 'Webhook signature verification failed' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          // One-time product purchase
          const purchaseCol = await getCollection<IPurchase>('purchases');
          await purchaseCol.updateOne(
            { stripeSessionId: session.id },
            {
              $set: {
                status: 'completed',
                stripePaymentId: session.payment_intent as string,
                purchaseDate: new Date(),
              },
            }
          );
        } else if (session.mode === 'subscription') {
          // Subscription checkout completed
          const userId = session.metadata?.userId;
          if (userId) {
            const userCol = await getCollection<IUser>('users');
            await userCol.updateOne(
              { _id: new ObjectId(userId) },
              {
                $set: {
                  stripeCustomerId: session.customer as string,
                  subscriptionStatus: 'active',
                  subscriptionPlan: session.metadata?.plan as 'monthly' | 'yearly',
                  updatedAt: new Date(),
                },
              }
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userCol = await getCollection<IUser>('users');
        const periodEnd = (subscription as unknown as Record<string, number>).current_period_end;

        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'cancelled';

        await userCol.updateOne(
          { stripeCustomerId: subscription.customer as string },
          {
            $set: {
              subscriptionStatus: status,
              subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
              updatedAt: new Date(),
            },
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userCol = await getCollection<IUser>('users');
        const periodEnd = (subscription as unknown as Record<string, number>).current_period_end;

        await userCol.updateOne(
          { stripeCustomerId: subscription.customer as string },
          {
            $set: {
              subscriptionStatus: 'cancelled',
              subscriptionPlan: null,
              subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
              updatedAt: new Date(),
            },
          }
        );
        break;
      }
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
    return;
  }

  res.json({ received: true });
};
