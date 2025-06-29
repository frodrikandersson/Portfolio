import { useRef } from 'react';

export function useSwipeSidebar(isMobile: boolean, sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void) {
  const startXRef = useRef(0);
  const gestureHandledRef = useRef(false);
  const sidebarWasOpenRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startXRef.current = e.touches[0].clientX;
    gestureHandledRef.current = false;
    sidebarWasOpenRef.current = sidebarOpen;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || gestureHandledRef.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startXRef.current;

    if (sidebarWasOpenRef.current && deltaX < -50) {
      setSidebarOpen(false);
      gestureHandledRef.current = true;
    }

    if (!sidebarWasOpenRef.current && startXRef.current < 30 && deltaX > 50) {
      setSidebarOpen(true);
      gestureHandledRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    startXRef.current = 0;
    gestureHandledRef.current = false;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
