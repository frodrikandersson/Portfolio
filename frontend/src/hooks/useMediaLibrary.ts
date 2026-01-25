import { useState, useEffect, useCallback } from 'react';
import {
  adminGetAllMedia,
  adminUploadMedia,
  adminUpdateMedia,
  adminDeleteMedia,
  adminSyncMedia,
} from '../services/mediaService';
import type { IMediaFrontend, IMediaUpdate, IMediaUsageRef } from '../models/MediaInterface';

export const useMediaLibrary = () => {
  const [media, setMedia] = useState<IMediaFrontend[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetAllMedia();
      setMedia(data.media);
      setError('');
    } catch {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const selectedMedia = media.find(m => m._id === selectedId) ?? null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const newMedia = await adminUploadMedia(file);
      setMedia(prev => [newMedia, ...prev]);
      setSuccess('Image uploaded');
      setSelectedId(newMedia._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string, data: IMediaUpdate) => {
    setError('');
    setSuccess('');
    try {
      const updated = await adminUpdateMedia(id, data);
      setMedia(prev => prev.map(m => (m._id === id ? updated : m)));
      setSuccess('Media updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string, force = false): Promise<{ success: boolean; usageRefs?: IMediaUsageRef[] }> => {
    setError('');
    setSuccess('');
    try {
      const result = await adminDeleteMedia(id, force);
      if ('usageRefs' in result) {
        return { success: false, usageRefs: result.usageRefs };
      }
      setMedia(prev => prev.filter(m => m._id !== id));
      setSelectedId(null);
      setSuccess('Media deleted');
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return { success: false };
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await adminSyncMedia();
      const total = result.synced.products + result.synced.blogs + result.synced.users;
      setSuccess(`Synced ${total} images`);
      await fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    media,
    selectedId,
    setSelectedId,
    selectedMedia,
    loading,
    uploading,
    error,
    success,
    handleUpload,
    handleUpdate,
    handleDelete,
    handleSync,
    fetchMedia,
  };
};
