import React, { createContext, useContext, useState } from 'react';
import type { SidebarType } from '../models/Sidebar';

interface SidebarContextType {
  sidebarType: SidebarType;
  setSidebarType: (type: SidebarType) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarType, setSidebarType] = useState<SidebarType>(null);

  return (
    <SidebarContext.Provider value={{ sidebarType, setSidebarType }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
