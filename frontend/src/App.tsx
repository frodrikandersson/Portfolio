import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SidebarProvider } from './contexts/SidebarContext';
import { TabProvider } from './contexts/TabContext';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <BlogProvider>
            <TabProvider>
              <AppRoutes />
            </TabProvider>
          </BlogProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
