import { useCallback, useEffect } from 'react';
import { useHorizontalScroll } from './useHorizontalScroll';
import { useLongPressDrag, type DragState } from './useLongPressDrag';

interface TabBarInteractionResult {
  tabBarRef: (node: HTMLDivElement | null) => void;
  dragState: DragState;
  containerHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  tabHandlers: {
    onMouseDown: (e: React.MouseEvent, index: number) => void;
    onTouchStart: (e: React.TouchEvent, index: number) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
  };
  wasRecentDrag: () => boolean;
}

export function useTabBarInteraction(
  onTabReorder: (fromIndex: number, toIndex: number) => void
): TabBarInteractionResult {
  const {
    containerRef: scrollRef,
    onMouseDown: onScrollMouseDown,
    onMouseMove: onScrollMouseMove,
    onMouseLeave: onScrollMouseLeave,
    onMouseUp: onScrollMouseUp,
    wasRecentDrag,
    reset: resetScroll,
  } = useHorizontalScroll<HTMLDivElement>();

  const {
    containerRef: dragRef,
    dragState,
    handlers: dragHandlers,
  } = useLongPressDrag<HTMLDivElement>(onTabReorder);

  // When drag mode activates, reset scroll state to prevent "catch up"
  useEffect(() => {
    if (dragState.isDragging) {
      resetScroll();
    }
  }, [dragState.isDragging, resetScroll]);

  // Add non-passive touch listener to prevent scroll during drag
  // React event handlers are passive by default, so we need to use addEventListener
  // Only prevent when actually dragging (not pending) - pending allows scroll to cancel it
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent scroll when actually in drag mode, not during pending
      // During pending, if user swipes, the movement will cancel pending and allow scroll
      if (dragState.isDragging) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragState.isDragging, scrollRef]);

  // Combine refs
  const tabBarRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    dragRef.current = node;
  }, [scrollRef, dragRef]);

  // Combined mouse handlers for the container
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Always init scroll - it will be reset if drag mode activates
    if (!dragState.isDragging) {
      onScrollMouseDown(e);
    }
  }, [dragState.isDragging, onScrollMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Always call drag handler during pending/dragging to detect movement
    if (dragState.isPending || dragState.isDragging) {
      dragHandlers.onMouseMove(e);
    }
    // Only scroll if not in drag mode
    if (!dragState.isDragging) {
      onScrollMouseMove(e);
    }
  }, [dragState.isPending, dragState.isDragging, dragHandlers, onScrollMouseMove]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isPending || dragState.isDragging) {
      dragHandlers.onMouseUp();
    }
    if (!dragState.isDragging) {
      onScrollMouseUp();
    }
  }, [dragState.isPending, dragState.isDragging, dragHandlers, onScrollMouseUp]);

  const handleMouseLeave = useCallback(() => {
    if (dragState.isPending || dragState.isDragging) {
      dragHandlers.onMouseLeave();
    }
    if (!dragState.isDragging) {
      onScrollMouseLeave();
    }
  }, [dragState.isPending, dragState.isDragging, dragHandlers, onScrollMouseLeave]);

  return {
    tabBarRef,
    dragState,
    containerHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
    tabHandlers: {
      onMouseDown: dragHandlers.onMouseDown,
      onTouchStart: dragHandlers.onTouchStart,
      onTouchMove: dragHandlers.onTouchMove,
      onTouchEnd: dragHandlers.onTouchEnd,
      onTouchCancel: dragHandlers.onTouchCancel,
    },
    wasRecentDrag,
  };
}
