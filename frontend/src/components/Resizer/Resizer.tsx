import React from 'react';
import classes from './Resizer.module.css';

type ResizerProps = {
  onDrag: (deltaX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
};

export const Resizer: React.FC<ResizerProps> = ({ onDrag, onResizeStart, onResizeEnd }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onResizeStart?.();

    let prevX = e.clientX;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - prevX;
      prevX = e.clientX;
      onDrag(deltaX);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onResizeEnd?.(); 
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return <div className={classes.resizer} onMouseDown={handleMouseDown} />;
};
