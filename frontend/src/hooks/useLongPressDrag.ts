import { useCallback, useRef, useState } from 'react';

const LONG_PRESS_DURATION = 400; // ms before drag is initiated
const MOVE_THRESHOLD = 10; // pixels of movement that cancels long-press

export interface DragState {
  isPending: boolean; // waiting for long-press timer
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

interface Position {
  x: number;
  y: number;
}

export function useLongPressDrag<T extends HTMLElement>(
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isPending: false,
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
  });

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosition = useRef<Position | null>(null);
  const pendingDragIndex = useRef<number | null>(null);
  const containerRef = useRef<T | null>(null);
  const isPendingRef = useRef(false); // Sync ref for immediate checks

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const startLongPress = useCallback((index: number, clientX: number, clientY: number) => {
    clearLongPressTimer();
    startPosition.current = { x: clientX, y: clientY };
    pendingDragIndex.current = index;
    isPendingRef.current = true; // Set immediately for sync checks

    setDragState({
      isPending: true,
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
    });

    longPressTimer.current = setTimeout(() => {
      isPendingRef.current = false;
      setDragState({
        isPending: false,
        isDragging: true,
        draggedIndex: index,
        dragOverIndex: index,
      });
      pendingDragIndex.current = null;
    }, LONG_PRESS_DURATION);
  }, [clearLongPressTimer]);

  const cancelLongPress = useCallback(() => {
    clearLongPressTimer();
    startPosition.current = null;
    pendingDragIndex.current = null;
    isPendingRef.current = false;
    setDragState({
      isPending: false,
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
    });
  }, [clearLongPressTimer]);

  const endDrag = useCallback(() => {
    if (dragState.isDragging && dragState.draggedIndex !== null && dragState.dragOverIndex !== null) {
      if (dragState.draggedIndex !== dragState.dragOverIndex) {
        onReorder(dragState.draggedIndex, dragState.dragOverIndex);
      }
    }
    setDragState({
      isPending: false,
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
    });
    clearLongPressTimer();
    startPosition.current = null;
    pendingDragIndex.current = null;
  }, [dragState, onReorder, clearLongPressTimer]);

  const handleMove = useCallback((clientX: number, _clientY: number) => {
    // If still waiting for long press, check if moved too much
    if (startPosition.current && pendingDragIndex.current !== null) {
      const dx = Math.abs(clientX - startPosition.current.x);
      const dy = Math.abs(_clientY - startPosition.current.y);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        cancelLongPress();
        return;
      }
    }

    // If dragging, find which tab we're over
    if (dragState.isDragging && containerRef.current) {
      const tabs = containerRef.current.querySelectorAll('[data-tab-index]');
      let newDragOverIndex = dragState.dragOverIndex;

      tabs.forEach((tab) => {
        const rect = tab.getBoundingClientRect();
        const tabCenter = rect.left + rect.width / 2;

        if (clientX >= rect.left && clientX <= rect.right) {
          const tabIndex = parseInt(tab.getAttribute('data-tab-index') || '0', 10);
          // Determine if we should place before or after this tab
          if (clientX < tabCenter) {
            newDragOverIndex = tabIndex;
          } else {
            newDragOverIndex = tabIndex;
          }
        }
      });

      if (newDragOverIndex !== dragState.dragOverIndex) {
        setDragState(prev => ({
          ...prev,
          dragOverIndex: newDragOverIndex,
        }));
      }
    }
  }, [dragState.isDragging, dragState.dragOverIndex, cancelLongPress]);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (e.button !== 0) return; // Only left click
    startLongPress(index, e.clientX, e.clientY);
  }, [startLongPress]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const onMouseLeave = useCallback(() => {
    if (!dragState.isDragging) {
      cancelLongPress();
    }
  }, [dragState.isDragging, cancelLongPress]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    startLongPress(index, touch.clientX, touch.clientY);
  }, [startLongPress]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    // Only prevent scrolling when actually dragging
    // During pending, let scroll happen naturally (it will cancel pending via handleMove)
    if (dragState.isDragging) {
      e.preventDefault();
    }
  }, [handleMove, dragState.isDragging]);

  const onTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const onTouchCancel = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  return {
    containerRef,
    dragState,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
    },
  };
}
