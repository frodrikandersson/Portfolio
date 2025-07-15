import React, { useEffect, useState } from 'react';
import { LeftSidebar } from '../components/LeftSidebar/LeftSidebar';
import { SecondarySidebar } from '../components/SecondarySidebar/SecondarySidebar';
import { Footer } from '../components/Footer/Footer';
import { Resizer } from '../components/Resizer/Resizer';
import { MainContent } from '../components/MainContent/MainContent';
import { useSidebar } from '../contexts/SidebarContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useSwipeSidebar } from '../hooks/useSwipeSidebar';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import classes from './Pages.module.css';

export const EditorPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { sidebarType } = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  const { width: secondaryWidth, updateWidth } = useSidebarWidth(isMobile);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeSidebar(isMobile, sidebarOpen, setSidebarOpen);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className={classes.editorPage}>
      <div
        className={classes.contentArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={classes.sidebarRegion}>
          <div className={`${classes.leftSidebarWrapper} ${sidebarOpen ? classes.open : ''}`}>
            <LeftSidebar />
            {sidebarType && (
              <div
                className={classes.secondarySidebarWrapper}
                style={{
                  width: sidebarOpen ? (isMobile ? '50vw' : `${secondaryWidth}px`) : 0,
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
              {sidebarOpen ? '◀' : '➤'}
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
