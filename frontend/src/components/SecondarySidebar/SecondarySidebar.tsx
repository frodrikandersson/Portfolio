import React from 'react';
import classes from './SecondarySidebar.module.css';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTabs } from '../../contexts/TabContext';
import { useSidebarMenus } from '../../data/sidebarMenus';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const SecondarySidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const { sidebarType } = useSidebar();
  const { state, dispatch } = useTabs();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const sidebarMenus = useSidebarMenus();

  const handleOpenTab = (id: string, title: string, componentName : string) => {
    const existingTab = state.tabs.find((tab) => tab.id === id);
    if (!existingTab) {
      dispatch({ type: 'ADD_TAB', tab: { id, title, componentName } });
    }
    dispatch({ type: 'SET_ACTIVE', id });
    if (isMobile) {
      onLinkClick?.();
    }
  };

  const menuItems = sidebarType ? sidebarMenus[sidebarType] : [];

  return (
    <aside className={classes.secondarySidebar}>
      <h2 className={classes.sidebarTitle}>{sidebarType ?? ''}</h2>
      <ul className={classes.menuList}>
        {menuItems.map(({ id, title, componentName, label }) => (
          <li
            key={id}
            className={classes.menuItem}
            onClick={() => handleOpenTab(id, title, componentName)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && handleOpenTab(id, title, componentName)}
          >
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
};
