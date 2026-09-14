/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { IBlogPost } from '../models/BlogPostInterface';
import {
  publicGetAllBlogPosts,
  privateCreateBlogPost,
  privateUpdateBlogPost,
  privateDeleteBlogPost
} from '../services/blogService';
import { useRetryingFetch } from '../hooks/useRetryingFetch';

interface BlogContextType {
  blogPosts: IBlogPost[];
  addPost: (postData: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IBlogPost>;
  updatePost: (id: string, updatedPost: Partial<IBlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const fetchBlogPosts = () => publicGetAllBlogPosts().then(data => data.posts || []);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    data: blogPosts,
    setData: setBlogPosts,
    loading,
    setLoading,
    error,
    setError,
    retry,
  } = useRetryingFetch<IBlogPost[]>(fetchBlogPosts, [], 'Failed to load blog posts');

  const addPost = useCallback(
    async (postData: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBlogPost> => {
      try {
        setLoading(true);
        const newPost = await privateCreateBlogPost(postData as Record<string, unknown>);
        setBlogPosts(prev => [...prev, newPost]);
        setError(null);
        return newPost;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add blog post');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setBlogPosts, setError, setLoading]
  );

  const updatePost = useCallback(
    async (id: string, updatedPost: Partial<IBlogPost>) => {
      try {
        setLoading(true);
        const updated = await privateUpdateBlogPost(id, updatedPost as Record<string, unknown>);
        setBlogPosts(prev =>
          prev.map(p => (p._id === id ? updated : p))
        );
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update blog post');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setBlogPosts, setError, setLoading]
  );

  const deletePost = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await privateDeleteBlogPost(id);
        setBlogPosts(prev => prev.filter(p => p._id !== id));
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete blog post');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setBlogPosts, setError, setLoading]
  );

  const value = useMemo(
    () => ({ blogPosts, addPost, updatePost, deletePost, loading, error, retry }),
    [blogPosts, addPost, updatePost, deletePost, loading, error, retry]
  );

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within BlogProvider');
  return context;
};
