import { apiFetch } from './api';
import type { ISubscriptionStatus } from '../models/ProductInterface';

export interface StripePrice {
  id: string;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  intervalCount: number;
  productName: string | null;
}

export const getSubscriptionPrices = async (): Promise<{
  monthly: StripePrice;
  yearly: StripePrice;
}> => {
  return apiFetch('/subscriptions/prices');
};

export const createSubscriptionCheckout = async (plan: 'monthly' | 'yearly') => {
  return apiFetch<{ checkoutUrl: string }>('/subscriptions/checkout', {
    method: 'POST',
    body: { plan },
  });
};

export const getSubscriptionStatus = async () => {
  return apiFetch<ISubscriptionStatus>('/subscriptions/status');
};

export const createCustomerPortal = async () => {
  return apiFetch<{ portalUrl: string }>('/subscriptions/portal', {
    method: 'POST',
  });
};
