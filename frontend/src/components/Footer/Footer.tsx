import React from 'react';
import classes from './Footer.module.css';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTabs } from '../../contexts/TabContext';

export const Footer: React.FC = () => {
  const { sidebarType } = useSidebar();
  const { state } = useTabs();

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);

  const cleanTitle = (title: string) => title.replace(/\.tsx$/i, '');

  let displayText = 'start';

  if (sidebarType) {
    displayText = sidebarType;
    if (activeTab) {
      displayText += ` > ${cleanTitle(activeTab.title)}`;
    }
  }

  return (
    <footer className={classes.footer} role="contentinfo">
      <div>{displayText}</div>
    </footer>
  );
};
