import React, { Suspense, lazy, useCallback, useEffect } from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useLongPressDrag } from '../../hooks/useLongPressDrag';

const HomePage = lazy(() => import('../../pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../../pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProductsPage = lazy(() => import('../../pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const SubscriptionPage = lazy(() => import('../../pages/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));
const SupportPage = lazy(() => import('../../pages/SupportPage').then(m => ({ default: m.SupportPage })));
const SocialLinksPage = lazy(() => import('../../pages/SocialLinksPage').then(m => ({ default: m.SocialLinksPage })));
const BlogPostPage = lazy(() => import('../../pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const LibraryPage = lazy(() => import('../../pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const TermsOfServicePage = lazy(() => import('../../pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const ProfilePage = lazy(() => import('../../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const RegisterPage = lazy(() => import('../../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const AdminPage = lazy(() => import('../../pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AuthPanel = lazy(() => import('../AuthPanel/AuthPanel').then(m => ({ default: m.AuthPanel })));

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  HomePage,
  AboutPage,
  ProductsPage,
  SubscriptionPage,
  SupportPage,
  SocialLinksPage,
  AuthPanel,
  RegisterPage,
  ProfilePage,
  AdminPage,
  BlogPostPage,
  LibraryPage,
  TermsOfServicePage,
};

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabReorder,
}) => {

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
useEffect(() => {
  const container = scrollRef.current;
  if (!container) return;

  const handleTouchMove = (e: TouchEvent) => {
    if (dragState.isPending || dragState.isDragging) {
      e.preventDefault();
    }
  };

  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  return () => {
    container.removeEventListener('touchmove', handleTouchMove);
  };
}, [dragState.isPending, dragState.isDragging, scrollRef]);

// Combine refs
const tabBarRef = useCallback((node: HTMLDivElement | null) => {
  scrollRef.current = node;
  dragRef.current = node;
}, [scrollRef, dragRef]);

// Combined mouse handlers
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

  const handleTabClick = (tabId: string) => {
    if (wasRecentDrag() || dragState.isDragging) return;
    onTabClick(tabId);
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    // Middle mouse button is button 1
    if (e.button === 1) {
      e.preventDefault();
      onTabClose(tabId);
    }
  };

  const getTabClassName = (tab: Tab, index: number) => {
    let className = classes.tab;
    if (tab.id === activeTabId) className += ` ${classes.active}`;
    if (dragState.isDragging) {
      if (dragState.draggedIndex === index) className += ` ${classes.dragging}`;
      if (dragState.dragOverIndex === index && dragState.draggedIndex !== index) {
        className += ` ${classes.dragOver}`;
      }
    }
    return className;
  };

  return (
    <div className={classes.editorTabs}>
      <div
        className={`${classes.tabBar} ${dragState.isDragging ? classes.tabBarDragging : ''}`}
        ref={tabBarRef}
        role="tablist"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            data-tab-index={index}
            className={getTabClassName(tab, index)}
            role="tab"
            aria-selected={tab.id === activeTabId}
            onClick={() => handleTabClick(tab.id)}
            onAuxClick={(e) => handleMiddleClick(e, tab.id)}
            onMouseDown={(e) => dragHandlers.onMouseDown(e, index)}
            onTouchStart={(e) => dragHandlers.onTouchStart(e, index)}
            onTouchMove={dragHandlers.onTouchMove}
            onTouchEnd={dragHandlers.onTouchEnd}
            onTouchCancel={dragHandlers.onTouchCancel}
          >
            <div>{tab.title}</div>
            <div className={classes.tabButtons}>
              <button
                className={classes.closeBtn}
                aria-label={`Close ${tab.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={classes.editorContent} role="tabpanel">
        <Suspense fallback={<div className={classes.loading}>Loading...</div>}>
          {(() => {
            const activeTab = tabs.find((tab) => tab.id === activeTabId);
            if (!activeTab) return null;
            const Component = componentMap[activeTab.componentName];
            return Component ? <Component {...activeTab.props} /> : <div>Component not found</div>;
          })()}
        </Suspense>
      </div>
    </div>
  );
};
