import React from 'react';
import classes from './SecondarySidebar.module.css';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTabs } from '../../contexts/TabContext';
import { sidebarMenus } from '../../data/sidebarMenus';

export const SecondarySidebar: React.FC = () => {
  const { sidebarType } = useSidebar();
  const { state, dispatch } = useTabs();

  const handleOpenTab = (id: string, title: string, content: React.ReactNode) => {
    const existingTab = state.tabs.find((tab) => tab.id === id);
    if (!existingTab) {
      dispatch({ type: 'ADD_TAB', tab: { id, title, content } });
    }
    dispatch({ type: 'SET_ACTIVE', id });
  };

  const menuItems = sidebarType ? sidebarMenus[sidebarType] : [];

  return (
    <aside
      className={`${classes.secondarySidebar} ${!sidebarType ? classes.hidden : ''}`}
    >
      <h2 className={classes.sidebarTitle}>{sidebarType ?? ''}</h2>
      <ul className={classes.menuList}>
        {menuItems.map(({ id, title, content, label }) => (
          <li
            key={id}
            className={classes.menuItem}
            onClick={() => handleOpenTab(id, title, content)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && handleOpenTab(id, title, content)}
          >
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
};
