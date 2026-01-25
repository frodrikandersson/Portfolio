import { useEffect } from 'react';
import { useTabs } from '../contexts/TabContext';

export function useTabKeyboardShortcuts() {
  const { state, dispatch } = useTabs();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+W or Cmd+W to close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        // Only prevent default if we have tabs to close
        if (state.tabs.length > 0 && state.activeTabId) {
          e.preventDefault();
          dispatch({ type: 'CLOSE_TAB', id: state.activeTabId });
        }
        // If no tabs, let the browser handle it (close browser tab)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.tabs.length, state.activeTabId, dispatch]);
}
