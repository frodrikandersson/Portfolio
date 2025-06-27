import React from 'react';
import classes from './LeftSidebar.module.css';
import { useSidebar } from '../../contexts/SidebarContext';
import { sidebarSections } from '../../data/sidebarSections';

export const LeftSidebar: React.FC = () => {
  const { sidebarType, setSidebarType } = useSidebar();

  return (
    <aside className={classes.leftSidebar}>
      {sidebarSections.map(({ type, label }) => (
        <button
          key={type}
          onClick={() => {
            if (sidebarType === type) {
              setSidebarType(null);
            } else {
              setSidebarType(type as any);
            }
          }}
          className={`${classes.sidebarButton} ${sidebarType === type ? classes.active : ''}`}
        >
          {label}
        </button>
      ))}
    </aside>
  );
};
