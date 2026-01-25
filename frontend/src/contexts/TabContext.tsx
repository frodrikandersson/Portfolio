/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Action, State, TabContextType } from '../models/Tab';

const TabContext = createContext<TabContextType | undefined>(undefined);

const STORAGE_KEY = 'editorTabsState';

function tabReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TAB': {
      const exists = state.tabs.some((tab) => tab.id === action.tab.id);
      return {
        ...state,
        tabs: exists ? state.tabs : [...state.tabs, action.tab],
        activeTabId: action.tab.id,
      };
    }
    case 'CLOSE_TAB': {
      const remaining = state.tabs.filter((tab) => tab.id !== action.id);

      let newActiveTabId = state.activeTabId;

      // Only change active tab if we're closing the active tab
      if (state.activeTabId === action.id) {
        if (remaining.length > 0) {
          // Find the index of the closed tab to pick an adjacent one
          const closedIndex = state.tabs.findIndex((tab) => tab.id === action.id);
          // Prefer the tab to the right, otherwise the one to the left
          const newIndex = Math.min(closedIndex, remaining.length - 1);
          newActiveTabId = remaining[newIndex].id;
        } else {
          newActiveTabId = '';
        }
      }

      return {
        tabs: remaining,
        activeTabId: newActiveTabId,
      };
    }
    case 'SET_ACTIVE':
      return {
        ...state,
        activeTabId: action.id,
      };
    default:
      return state;
  }
}

export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tabReducer, {
    tabs: [],
    activeTabId: '',
  }, () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { tabs: [], activeTabId: '' };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

export const useTabs = (): TabContextType => {
  const context = useContext(TabContext);
  if (!context) throw new Error('useTabs must be used within a TabProvider');
  return context;
};
