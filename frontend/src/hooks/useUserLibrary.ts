import { useState, useEffect } from 'react';
import { getMyPurchases, downloadProduct } from '../services/productService';
import type { IPurchaseFrontend } from '../models/ProductInterface';

export const useUserLibrary = () => {
  const [purchases, setPurchases] = useState<IPurchaseFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const data = await getMyPurchases();
        setPurchases(data.purchases);
      } catch {
        setError('Failed to load your library');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const handleDownload = async (productId: string) => {
    setDownloadingId(productId);
    try {
      await downloadProduct(productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  return { purchases, loading, error, downloadingId, handleDownload };
};
