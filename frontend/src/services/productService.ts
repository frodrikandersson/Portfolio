import { apiFetch, API_URL } from './api';
import type { IProductFrontend, IPurchaseFrontend } from '../models/ProductInterface';

// === Public ===

export const publicGetAllProducts = async (page = 1, limit = 20, category?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  return apiFetch<{ products: IProductFrontend[] }>(`/products/public?${params}`);
};

export const publicGetProductBySlug = async (slug: string) => {
  return apiFetch<IProductFrontend>(`/products/public/${slug}`);
};

// === Authenticated ===

export const createCheckoutSession = async (productId: string) => {
  return apiFetch<{ checkoutUrl: string }>('/products/purchase', {
    method: 'POST',
    body: { productId },
  });
};

export const verifyPurchase = async (sessionId: string) => {
  return apiFetch<{ message: string }>('/products/verify-purchase', {
    method: 'POST',
    body: { sessionId },
  });
};

export const getMyPurchasedProductIds = async (): Promise<string[]> => {
  const data = await apiFetch<{ productIds: string[] }>('/products/my-purchased-ids');
  return data.productIds;
};

export const getMyPurchases = async () => {
  return apiFetch<{ purchases: IPurchaseFrontend[] }>('/products/my-purchases');
};

export const downloadProduct = async (productId: string) => {
  const res = await fetch(`${API_URL}/products/download/${productId}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Download failed');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const filenameMatch = disposition?.match(/filename="(.+)"/);
  const filename = filenameMatch ? filenameMatch[1] : 'download';

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// === Admin ===

export const adminGetAllProducts = async () => {
  return apiFetch<{ products: IProductFrontend[] }>('/products/admin');
};

export const adminCreateProduct = async (formData: FormData) => {
  return apiFetch<IProductFrontend>('/products/admin', {
    method: 'POST',
    body: formData,
  });
};

export const adminUpdateProduct = async (id: string, formData: FormData) => {
  return apiFetch<IProductFrontend>(`/products/admin/${id}`, {
    method: 'PATCH',
    body: formData,
  });
};

export const adminDeleteProduct = async (id: string) => {
  await apiFetch(`/products/admin/${id}`, {
    method: 'DELETE',
  });
};

export const adminUploadCover = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('cover', file);
  return apiFetch(`/products/admin/${id}/cover`, {
    method: 'POST',
    body: formData,
  });
};
