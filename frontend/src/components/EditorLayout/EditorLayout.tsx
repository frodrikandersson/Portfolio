import React, { useState } from 'react';
import { LeftSidebar } from '../LeftSidebar/LeftSidebar';
import { SecondarySidebar } from '../SecondarySidebar/SecondarySidebar';
import { Footer } from '../Footer/Footer';
import { Resizer } from '../Resizer/Resizer';
import { MainContent } from '../MainContent/MainContent';
import { useSidebar } from '../../contexts/SidebarContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSwipeSidebar } from '../../hooks/useSwipeSidebar';
import { useSidebarWidth } from '../../hooks/useSidebarWidth';
import classes from './EditorLayout.module.css';

export const EditorLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { sidebarType } = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setIsResizing] = useState(false);

  const { width: secondaryWidth, updateWidth } = useSidebarWidth(isMobile);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeSidebar(isMobile, sidebarOpen, setSidebarOpen);

  const shouldShowSidebar = !isMobile || sidebarOpen;

  return (
    <div className={classes.container}>
      <div
        className={classes.contentArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={classes.sidebarRegion}>
          <div className={`${classes.leftSidebarWrapper} ${shouldShowSidebar ? classes.open : ''}`}>
            <LeftSidebar />
            {sidebarType && (
              <div
                className={classes.secondarySidebarWrapper}
                style={{
                  width: shouldShowSidebar ? (isMobile ? '50vw' : `${secondaryWidth}px`) : 0,
                  overflow: 'hidden',
                }}
              >
                <SecondarySidebar onLinkClick={() => setSidebarOpen(false)} />
              </div>
            )}
          </div>

          {isMobile && (
            <div
              className={classes.slideArrow}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                left: sidebarOpen
                  ? (sidebarType ? `calc(50vw + 25px)` : `25px`)
                  : `-15px`,
              }}
            >
              {sidebarOpen ? '\u25C0' : '\u27A4'}
            </div>
          )}
        </div>

        <Resizer
          onDrag={updateWidth}
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
