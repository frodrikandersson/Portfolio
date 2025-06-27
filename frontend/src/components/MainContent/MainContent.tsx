import React from 'react';
import classes from './MainContent.module.css';
import { EditorTabs } from '../EditorTabs/EditorTabs';
import { useTabs } from '../../contexts/TabContext';

export const MainContent: React.FC = () => {
  const { state, dispatch } = useTabs();

  if (state.tabs.length === 0) {
    return (
      <div className={classes.emptyState}>
        <img src="/gif/movingLogo.webp" alt="No open tabs" />
        <p>No files open. Start by opening or creating a new tab.</p>
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
