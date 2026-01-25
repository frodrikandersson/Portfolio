import { useEffect } from 'react';
import { useTabs } from '../contexts/TabContext';

export function useTabKeyboardShortcuts() {
  const { state, dispatch } = useTabs();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+W to close active tab
      if (e.altKey && e.key.toLowerCase() === 'w') {
        if (state.tabs.length > 0 && state.activeTabId) {
          e.preventDefault();
          dispatch({ type: 'CLOSE_TAB', id: state.activeTabId });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.tabs.length, state.activeTabId, dispatch]);
}
