import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IBlogPost } from '../models/BlogPostInterface';

interface BlogContextType {
  blogPosts: IBlogPost[];
  addPost: (post: IBlogPost) => void;
  updatePost: (id: string, updatedPost: Partial<IBlogPost>) => void;
  deletePost: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blogPosts, setBlogPosts] = useState<IBlogPost[]>([]);

  // Optional: load from localStorage or backend
    useEffect(() => {
        const stored = localStorage.getItem('blogPosts');
        if (stored) setBlogPosts(JSON.parse(stored));
    }, []);

    useEffect(() => {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    }, [blogPosts]);

    const addPost = (post: IBlogPost) => {
        setBlogPosts(prev => [...prev, post]);
    };

    const deletePost = (id: string) => {
        setBlogPosts(prev => prev.filter(p => p.id !== id));
    };

    const updatePost = (id: string, updatedPost: Partial<IBlogPost>) => {
        setBlogPosts(prev =>
            prev.map(p => p.id === id ? { ...p, ...updatedPost, updatedAt: new Date().toISOString() } : p)
        );
    };

  return (
    <BlogContext.Provider value={{ blogPosts, addPost, deletePost, updatePost }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used within BlogProvider");
  return context;
};
