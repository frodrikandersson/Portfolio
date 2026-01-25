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
            <div className={classes.tips}>
              <div className={classes.tip}>
                <kbd>Alt</kbd> + <kbd>W</kbd>
                <span className={classes.tipText}>Close active tab</span>
              </div>
              <div className={classes.tip}>
                <svg className={classes.mouseIcon} viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="22" height="34" rx="11" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="1" x2="12" y2="14" stroke="currentColor" strokeWidth="2"/>
                  <rect x="9" y="6" width="6" height="8" rx="2" fill="currentColor" className={classes.middleButton}/>
                </svg>
                <span className={classes.tipText}>Middle-click to close tab</span>
              </div>
            </div>
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
