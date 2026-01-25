import React, { Suspense, lazy } from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

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
  onTabDrop?: (tab: Tab) => void;
  onTabClose: (tabId: string) => void;
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
}) => {

const {
  containerRef: tabBarRef,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onMouseUp,
  wasRecentDrag,
} = useHorizontalScroll<HTMLDivElement>();

  const handleTabClick = (tabId: string) => {
    if (wasRecentDrag()) return;
    onTabClick(tabId);
  };

  return (
    <div className={classes.editorTabs}>
      <div
        className={classes.tabBar}
        ref={tabBarRef}
        role="tablist"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${classes.tab} ${tab.id === activeTabId ? classes.active : ''}`}
            role="tab"
            aria-selected={tab.id === activeTabId}
            onClick={() => handleTabClick(tab.id)}
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
