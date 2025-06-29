import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { Action, State, Tab, TabContextType } from '../models/Tab';

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
      const newActiveTabId = state.activeTabId === action.id && remaining.length > 0 ? remaining[0].id : '';

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

  return <TabContext.Provider value={{ state, dispatch }}>{children}</TabContext.Provider>;
};

export const useTabs = (): TabContextType => {
  const context = useContext(TabContext);
  if (!context) throw new Error('useTabs must be used within a TabProvider');
  return context;
};
