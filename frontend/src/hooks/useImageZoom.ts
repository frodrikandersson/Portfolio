import { useState, useRef, useCallback } from 'react';

export const useImageZoom = () => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);
  const tapRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const openModal = useCallback((src: string) => setModalImage(src), []);

  const closeModal = useCallback(() => {
    setModalImage(null);
    setZoom(1);
    setOrigin({ x: 50, y: 50 });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { startDist: Math.hypot(dx, dy), startZoom: zoom };
      tapRef.current = null;
    } else if (e.touches.length === 1) {
      tapRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = (dist / pinchRef.current.startDist) * pinchRef.current.startZoom;
      setZoom(Math.min(Math.max(scale, 1), 4));

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setOrigin({ x: (midX / window.innerWidth) * 100, y: (midY / window.innerHeight) * 100 });
      tapRef.current = null;
    } else if (e.touches.length === 1 && tapRef.current) {
      const dx = e.touches[0].clientX - tapRef.current.x;
      const dy = e.touches[0].clientY - tapRef.current.y;
      if (Math.hypot(dx, dy) > 10) tapRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
    if (tapRef.current && Date.now() - tapRef.current.time < 300) {
      closeModal();
    }
    tapRef.current = null;
  }, [closeModal]);

  return {
    modalImage,
    zoom,
    origin,
    openModal,
    closeModal,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
