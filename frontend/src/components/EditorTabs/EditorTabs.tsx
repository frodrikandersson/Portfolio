import React from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';
import { ProfilePage } from '../../pages/ProfilePage';
import { SearchPage } from '../../pages/SearchPage';
import { ExplorerPage } from '../../pages/ExplorerPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { LoginPage } from '../../pages/LoginPage';

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabDrop?: (tab: Tab) => void;
  onTabClose: (tabId: string) => void;
}

const componentMap: Record<string, React.FC> = {
  LoginPage,
  RegisterPage,
  ProfilePage,
  SearchPage,
  ExplorerPage
};

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabDrop,
  onTabClose,
}) => {
  const handleDragStart = (e: React.DragEvent, tab: Tab) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tab));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const data = e.dataTransfer.getData('application/json');
    if (data && onTabDrop) {
      const tab: Tab = JSON.parse(data);
      onTabDrop(tab);
    }
  };

  return (
    <div className={classes.editorTabs} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className={classes.tabBar} role="tablist">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${classes.tab} ${tab.id === activeTabId ? classes.active : ''}`}
            role="tab"
            aria-selected={tab.id === activeTabId}
            draggable
            onClick={() => onTabClick(tab.id)}
            onDragStart={(e) => handleDragStart(e, tab)}
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
          return Component ? <Component /> : <div>Component not found</div>;
        })()}
      </div>
    </div>
  );
};
