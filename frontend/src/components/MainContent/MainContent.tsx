import React from 'react';
import classes from './MainContent.module.css';
import { EditorTabs } from '../EditorTabs/EditorTabs';
import { useTabs } from '../../contexts/TabContext';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import { useTabKeyboardShortcuts } from '../../hooks/useTabKeyboardShortcuts';

export const MainContent: React.FC = () => {
  const { state, dispatch } = useTabs();
  useTabKeyboardShortcuts();

  if (state.tabs.length === 0) {
    return (
      <div className={classes.maskWrapper}>
        <div className={classes.mask}></div>
        
        <div className={classes.emptyState}>
          <div className={classes.wrapper}>
            <ResponsiveImage
              coverImage="https://files.quilcount.store/media/media-1769317602357-675056990.webp"
              alt="No open tabs"
              loading="eager"
              fetchPriority="high"
            />
            <p>No files open. Start by opening or creating a new tab.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={classes.container}>
      <section className={classes.panel}>
        <EditorTabs
          tabs={state.tabs}
          activeTabId={state.activeTabId}
          onTabClick={(id) => dispatch({ type: 'SET_ACTIVE', id })}
          onTabClose={(id) => dispatch({ type: 'CLOSE_TAB', id })}
        />
      </section>
    </main>
  );
};
