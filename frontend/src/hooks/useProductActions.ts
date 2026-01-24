import { useState } from 'react';
import { createCheckoutSession, downloadProduct } from '../services/productService';

export const useProductActions = () => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleBuy = async (productId: string) => {
    setActionLoading(productId);
    try {
      const data = await createCheckoutSession(productId);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (productId: string) => {
    setActionLoading(productId);
    try {
      await downloadProduct(productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setActionLoading(null);
    }
  };

  return { handleBuy, handleDownload, actionLoading, error, setError };
};
