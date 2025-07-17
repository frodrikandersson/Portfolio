import React from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';
import { ProfilePage } from '../../pages/ProfilePage';
import { RegisterPage } from '../../pages/RegisterPage';
import { AdminPage } from '../../pages/AdminPage';
import { AuthPanel } from '../AuthPanel/AuthPanel';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { HomePage } from '../../pages/HomePage';
import { AboutPage } from '../../pages/AboutPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { ContactPage } from '../../pages/ContactPage';
import { SocialLinksPage } from '../../pages/SocialLinksPage';
import { BlogPostPage } from '../../pages/BlogPostPage';

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabDrop?: (tab: Tab) => void;
  onTabClose: (tabId: string) => void;
}

const componentMap: Record<string, React.FC<any>> = {
  HomePage,
  AboutPage,
  ProductsPage,
  SubscriptionPage,
  ContactPage,
  SocialLinksPage,
  AuthPanel,
  RegisterPage,
  ProfilePage,
  AdminPage,
  BlogPostPage
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
} = useHorizontalScroll<HTMLDivElement>();

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
            onClick={() => onTabClick(tab.id)}
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
        {(() => {
          const activeTab = tabs.find((tab) => tab.id === activeTabId);
          if (!activeTab) return null;
          const Component = componentMap[activeTab.componentName];
          return Component ? <Component {...activeTab.props} /> : <div>Component not found</div>;
        })()}
      </div>
    </div>
  );
};
