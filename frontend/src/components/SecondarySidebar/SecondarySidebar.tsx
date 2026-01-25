import React from 'react';
import classes from './SecondarySidebar.module.css';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTabs } from '../../contexts/TabContext';
import { useSidebarMenus } from '../../hooks/useSidebarMenus';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const SecondarySidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const { sidebarType } = useSidebar();
  const { state, dispatch } = useTabs();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const sidebarMenus = useSidebarMenus();

const handleOpenTab = (
    id: string,
    title: string,
    componentName: string,
    props?: Record<string, unknown>
  ) => {
    const existingTab = state.tabs.find((tab) => tab.id === id);
    if (!existingTab) {
      dispatch({ type: 'ADD_TAB', tab: { id, title, componentName, props } });
    }
    dispatch({ type: 'SET_ACTIVE', id });
    if (isMobile) {
      onLinkClick?.();
    }
};

  const menuItems = (sidebarType && sidebarMenus[sidebarType]) || [];

  return (
    <aside className={classes.secondarySidebar}>
      <h2 className={classes.sidebarTitle}>{sidebarType ?? ''}</h2>
      <ul className={classes.menuList}>
        {menuItems.map(({ id, title, componentName, label, props, badge, relativeDate }) => (
          <li key={id} className={classes.menuItem}>
            <button
              type="button"
              className={classes.menuButton}
              onClick={() => handleOpenTab(id, title, componentName, props)}
            >
              <span className={classes.menuLabel}>
                {badge && (
                  <span className={`${classes.badge} ${classes[badge]}`}>
                    {badge.toUpperCase()}
                  </span>
                )}
                {label}
              </span>
              {relativeDate && (
                <span className={classes.menuDate}>{relativeDate}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
