import React from 'react';
import classes from './EditorTabs.module.css';
import type { Tab } from '../../models/Tab';

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabDrop?: (tab: Tab) => void;
  onSplit?: (tab: Tab, direction: 'right' | 'down') => void;
  onTabClose: (tabId: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabDrop,
  onSplit,
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
            {tab.title}
            <div className={classes.tabButtons}>
              {onSplit && (
                <>
                  <button
                    title="Split right"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplit(tab, 'right');
                    }}
                  >
                    ⇨
                  </button>
                  <button
                    title="Split down"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplit(tab, 'down');
                    }}
                  >
                    ⇩
                  </button>
                </>
              )}
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
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </div>
    </div>
  );
};
