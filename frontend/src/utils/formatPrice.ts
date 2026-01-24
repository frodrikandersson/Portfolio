import type { StripePrice } from '../services/subscriptionService';

export function formatPrice(price: StripePrice): string {
  if (price.unitAmount === null) return 'N/A';
  const amount = price.unitAmount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(amount);
}
