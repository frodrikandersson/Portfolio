// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EditorPage } from '../pages/EditorPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      
      {/* Add more routes here if needed, e.g.: */}
      {/* <Route path="/settings" element={<SettingsPage />} /> */}

      {/* Redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
