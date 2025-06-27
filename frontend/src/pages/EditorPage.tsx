import React, { useState } from 'react';
import { LeftSidebar } from '../components/LeftSidebar/LeftSidebar';
import { SecondarySidebar } from '../components/SecondarySidebar/SecondarySidebar';
import { Footer } from '../components/Footer/Footer';
import { Resizer } from '../components/Resizer/Resizer';
import { MainContent } from '../components/MainContent/MainContent';
import { useSidebar } from '../contexts/SidebarContext';
import classes from './Pages.module.css';

export const EditorPage: React.FC = () => {
  const [secondaryWidth, setSecondaryWidth] = useState(300);
  const { sidebarType } = useSidebar();
  const [isResizing, setIsResizing] = useState(false);

  const handleDrag = (deltaX: number) => {
    setSecondaryWidth((w) => Math.min(Math.max(w + deltaX, 150), 600));
  };

  return (
    <div className={classes.editorPage}>
      <div className={classes.contentArea}>
        <LeftSidebar />
        <div
          className={`${classes.secondarySidebarWrapper} ${!isResizing ? classes.animate : ''}`}
          style={{
            width: sidebarType ? secondaryWidth : 0,
            overflow: 'hidden',
          }}
        >
          <SecondarySidebar />
        </div>
        <Resizer
          onDrag={handleDrag}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
        />
        <main className={classes.mainContent}>
          <MainContent />
        </main>
      </div>
      <Footer />
    </div>
  );
};
