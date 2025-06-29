import React from 'react';
import classes from './Resizer.module.css';

type ResizerProps = {
  onDrag: (deltaX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
};

export const Resizer: React.FC<ResizerProps> = ({ onDrag, onResizeStart, onResizeEnd }) => {
  const handleStart = (clientX: number) => {
    onResizeStart?.();
    let prevX = clientX;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - prevX;
      prevX = currentX;
      onDrag(deltaX);
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove as any);
      document.removeEventListener('touchend', onEnd);
      onResizeEnd?.();
    };

    window.addEventListener('mousemove', onMove as any);
    window.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove as any, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  return (
    <div
      className={classes.resizer}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    />
  );
};
