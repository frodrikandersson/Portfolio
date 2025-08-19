import { useState } from "react";

const WIDTH_KEY = 'secondarySidebarWidth';
const defaultWidth = 300;

export function useSidebarWidth(isMobile: boolean) {
  // Use `isMobile` as part of a key to force new state when it changes
  const [width, setWidth] = useState(() => {
    if (isMobile) {
      return Math.floor(window.innerWidth * 0.5);
    }
    const saved = localStorage.getItem(WIDTH_KEY);
    return saved ? parseInt(saved, 10) : defaultWidth;
  });

  const updateWidth = (deltaX: number) => {
    setWidth((w) => {
      const newWidth = Math.min(Math.max(w + deltaX, 150), 600);
      localStorage.setItem(WIDTH_KEY, newWidth.toString());
      return newWidth;
    });
  };

  return { width, updateWidth };
}
