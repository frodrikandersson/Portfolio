/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SidebarType } from '../models/Sidebar';

interface SidebarContextType {
  sidebarType: SidebarType;
  setSidebarType: (type: SidebarType) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_KEY = 'sidebarType';

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarType, setSidebarTypeState] = useState<SidebarType>(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(sidebarType));
  }, [sidebarType]);

  const setSidebarType = useCallback((type: SidebarType) => setSidebarTypeState(type), []);
  const value = useMemo(() => ({ sidebarType, setSidebarType }), [sidebarType, setSidebarType]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
