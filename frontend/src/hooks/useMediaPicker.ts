import { useState, useCallback } from 'react';
import type { IMediaFrontend } from '../models/MediaInterface';

export const useMediaPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<IMediaFrontend | null>(null);

  const openPicker = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback((media: IMediaFrontend) => {
    setSelectedMedia(media);
    setIsOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  return {
    isOpen,
    selectedMedia,
    openPicker,
    closePicker,
    handleSelect,
    clearSelection,
  };
};
