import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SidebarProvider } from './contexts/SidebarContext';
import { TabProvider } from './contexts/TabContext';
import { AuthProvider } from './contexts/AuthContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <TabProvider>
            <AppRoutes />
         </TabProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
