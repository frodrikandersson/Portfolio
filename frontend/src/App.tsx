import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SidebarProvider } from './contexts/SidebarContext';
import { TabProvider } from './contexts/TabContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <TabProvider>
          <AppRoutes />
        </TabProvider>
      </SidebarProvider>
    </BrowserRouter>
  );
};
