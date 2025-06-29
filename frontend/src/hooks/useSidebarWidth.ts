import { useEffect, useState } from 'react';

const WIDTH_KEY = 'secondarySidebarWidth';
const defaultWidth = 300;

export function useSidebarWidth(isMobile: boolean) {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      return Math.floor(window.innerWidth * 0.5);
    }
    const saved = localStorage.getItem(WIDTH_KEY);
    return saved ? parseInt(saved, 10) : defaultWidth;
  });

  useEffect(() => {
    if (isMobile) {
      setWidth(Math.floor(window.innerWidth * 0.5));
    } else {
      const saved = localStorage.getItem(WIDTH_KEY);
      setWidth(saved ? parseInt(saved, 10) : defaultWidth);
    }
  }, [isMobile]);

  const updateWidth = (deltaX: number) => {
    setWidth((w) => {
      const newWidth = Math.min(Math.max(w + deltaX, 150), 600);
      localStorage.setItem(WIDTH_KEY, newWidth.toString());
      return newWidth;
    });
  };

  return { width, updateWidth };
}
