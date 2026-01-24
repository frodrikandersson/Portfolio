/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { IBlogPost } from '../models/BlogPostInterface';
import {
  publicGetAllBlogPosts,
  privateCreateBlogPost,
  privateUpdateBlogPost,
  privateDeleteBlogPost
} from '../services/blogService';

interface BlogContextType {
  blogPosts: IBlogPost[];
  addPost: (postData: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePost: (id: string, updatedPost: Partial<IBlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogPosts, setBlogPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    publicGetAllBlogPosts()
      .then(data => {
        setBlogPosts(data.posts || []);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Failed to load blog posts');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const addPost = useCallback(
    async (postData: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        const newPost = await privateCreateBlogPost(postData as Record<string, unknown>);
        setBlogPosts(prev => [...prev, newPost]);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to add blog post');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
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
    []
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
    []
  );

  const value = useMemo(
    () => ({ blogPosts, addPost, updatePost, deletePost, loading, error }),
    [blogPosts, addPost, updatePost, deletePost, loading, error]
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
