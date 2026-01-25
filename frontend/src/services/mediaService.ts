import { apiFetch, API_URL } from './api';
import type { IMediaFrontend, IMediaUpdate, IMediaUsageRef } from '../models/MediaInterface';

export const adminGetAllMedia = async (page = 1, limit = 50) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<{ media: IMediaFrontend[]; total: number; page: number; limit: number }>(
    `/media/admin?${params}`
  );
};

export const adminGetMediaById = async (id: string) => {
  return apiFetch<IMediaFrontend>(`/media/admin/${id}`);
};

export const adminUploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<IMediaFrontend>('/media/admin/upload', {
    method: 'POST',
    body: formData,
  });
};

export const adminUpdateMedia = async (id: string, data: IMediaUpdate) => {
  return apiFetch<IMediaFrontend>(`/media/admin/${id}`, {
    method: 'PATCH',
    body: data,
  });
};

export const adminDeleteMedia = async (id: string, force = false): Promise<{ message: string } | { message: string; usageRefs: IMediaUsageRef[] }> => {
  const params = force ? '?force=true' : '';

  const res = await fetch(`${API_URL}/media/admin/${id}${params}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await res.json();

  // 409 means media is in use - return the usage refs instead of throwing
  if (res.status === 409 && data.usageRefs) {
    return { message: data.message, usageRefs: data.usageRefs };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
};

export const adminGetMediaUsage = async (id: string) => {
  return apiFetch<{ usageRefs: IMediaUsageRef[] }>(`/media/admin/${id}/usage`);
};

export const adminSyncMedia = async () => {
  return apiFetch<{ message: string; synced: { products: number; blogs: number; users: number } }>(
    '/media/admin/sync',
    { method: 'POST' }
  );
};

export const adminLinkMediaToEntity = async (
  mediaId: string,
  entityType: 'product' | 'blogpost' | 'user',
  entityId: string,
  field?: string
) => {
  return apiFetch<{ message: string; coverImage: { baseName: string; originalExt: string; widths: number[]; path: string } }>(
    `/media/admin/${mediaId}/link`,
    {
      method: 'POST',
      body: { entityType, entityId, field },
    }
  );
};
