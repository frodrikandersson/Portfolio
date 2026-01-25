import { useRef, useCallback } from 'react';

const DRAG_THRESHOLD = 5; // pixels of movement before considering it a drag

export function useHorizontalScroll<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startX.current;

    // Only consider it a drag if we moved past the threshold
    if (Math.abs(walk) > DRAG_THRESHOLD) {
      hasDragged.current = true;
      e.preventDefault();
    }

    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Check if the last interaction was a drag (call this in click handlers)
  const wasRecentDrag = useCallback(() => {
    const wasDrag = hasDragged.current;
    // Reset after checking so next click works normally
    hasDragged.current = false;
    return wasDrag;
  }, []);

  return {
    containerRef,
    onMouseDown,
    onMouseMove,
    onMouseLeave: endDrag,
    onMouseUp: endDrag,
    wasRecentDrag,
  };
}
