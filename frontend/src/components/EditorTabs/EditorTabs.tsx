import React, { Suspense, lazy } from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';
import { useTabBarInteraction } from '../../hooks/useTabBarInteraction';

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
    tabBarRef,
    dragState,
    containerHandlers,
    tabHandlers,
    wasRecentDrag,
  } = useTabBarInteraction(onTabReorder);

  const handleTabClick = (tabId: string) => {
    if (wasRecentDrag() || dragState.isDragging) return;
    onTabClick(tabId);
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
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
        onMouseDown={containerHandlers.onMouseDown}
        onMouseLeave={containerHandlers.onMouseLeave}
        onMouseUp={containerHandlers.onMouseUp}
        onMouseMove={containerHandlers.onMouseMove}
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
            onMouseDown={(e) => tabHandlers.onMouseDown(e, index)}
            onTouchStart={(e) => tabHandlers.onTouchStart(e, index)}
            onTouchMove={tabHandlers.onTouchMove}
            onTouchEnd={tabHandlers.onTouchEnd}
            onTouchCancel={tabHandlers.onTouchCancel}
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
