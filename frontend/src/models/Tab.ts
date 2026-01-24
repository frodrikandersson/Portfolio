import React from 'react';

export interface Tab {
  id: string;
  title: string;
  componentName: string;
  props?: Record<string, unknown>;
}

export type State = {
  tabs: Tab[];
  activeTabId: string;
};

export type Action =
  | { type: 'ADD_TAB'; tab: Tab }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'SET_ACTIVE'; id: string };

export type TabContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
};