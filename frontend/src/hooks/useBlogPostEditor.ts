// components/useBlogPostEditor.ts
import { useContext } from 'react';
import { BlogPostEditorContext } from '../contexts/BlogPostEditorContext';

export const useBlogPostEditor = () => {
  const ctx = useContext(BlogPostEditorContext);
  if (!ctx) throw new Error('BlogPostEditorContext missing');
  return ctx;
};
