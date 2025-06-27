import { useState, useRef, useEffect } from 'react';

export function useResizable(initialWidth: number) {
  const [width, setWidth] = useState(initialWidth);
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizerRef.current) {
        const newWidth = e.clientX - resizerRef.current.getBoundingClientRect().left;
        if (newWidth > 100 && newWidth < 600) setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    const current = resizerRef.current;
    current?.addEventListener('mousedown', handleMouseDown);

    return () => {
      current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return { width, setWidth, resizerRef };
}
