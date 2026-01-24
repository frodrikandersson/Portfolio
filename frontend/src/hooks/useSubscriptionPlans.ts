import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createSubscriptionCheckout,
  getSubscriptionStatus,
  createCustomerPortal,
  getSubscriptionPrices,
} from '../services/subscriptionService';
import type { StripePrice } from '../services/subscriptionService';
import type { ISubscriptionStatus } from '../models/ProductInterface';

export const useSubscriptionPlans = () => {
  const { isLoggedIn } = useAuth();
  const [subStatus, setSubStatus] = useState<ISubscriptionStatus | null>(null);
  const [prices, setPrices] = useState<{ monthly: StripePrice; yearly: StripePrice } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getSubscriptionPrices();
        setPrices(data);
      } catch {
        // Prices unavailable
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setSubStatus(null); return; }
    const fetchStatus = async () => {
      setStatusLoading(true);
      try {
        const data = await getSubscriptionStatus();
        setSubStatus(data);
      } catch {
        // No subscription info available
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatus();
  }, [isLoggedIn]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setCheckoutLoading(plan);
    setError('');
    try {
      const data = await createSubscriptionCheckout(plan);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const data = await createCustomerPortal();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const isActive = subStatus?.subscriptionStatus === 'active';

  return {
    isLoggedIn,
    subStatus,
    prices,
    statusLoading,
    portalLoading,
    error,
    checkoutLoading,
    isActive,
    handleSubscribe,
    handleManage,
  };
};
