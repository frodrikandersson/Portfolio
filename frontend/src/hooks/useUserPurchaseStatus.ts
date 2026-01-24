import { useState, useEffect } from 'react';
import { verifyPurchase, getMyPurchasedProductIds } from '../services/productService';
import { getSubscriptionStatus } from '../services/subscriptionService';

export const useUserPurchaseStatus = (isLoggedIn: boolean) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setHasSubscription(false);
      setPurchasedIds(new Set());
      return;
    }

    const checkStatus = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId && params.get('purchase') === 'success') {
          await verifyPurchase(sessionId).catch(() => {});
          window.history.replaceState({}, '', window.location.pathname);
        }

        const [subData, ids] = await Promise.all([
          getSubscriptionStatus(),
          getMyPurchasedProductIds(),
        ]);
        setHasSubscription(subData.subscriptionStatus === 'active');
        setPurchasedIds(new Set(ids));
      } catch {
        // Ignore errors
      }
    };

    checkStatus();
  }, [isLoggedIn]);

  return { hasSubscription, purchasedIds };
};
