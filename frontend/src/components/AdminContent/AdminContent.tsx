import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BlogPostEditorProvider } from '../../contexts/BlogPostEditorContext';
import { BlogPostCreator } from '../BlogPostCreator/BlogPostCreator';
import { ShowBlogPosts } from '../ShowBlogPosts/ShowBlogPosts';
import { ProductManager } from '../ProductManager/ProductManager';
import classes from './AdminContent.module.css';

type AdminTab = 'blog' | 'products';

export const AdminContent = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('blog');

  if (role !== 'admin') {
    return (
      <div className={classes.container}>
        <div className={classes.denied}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h2>Admin Dashboard</h2>
      </div>
      <div className={classes.tabs}>
        <button
          className={`${classes.tab} ${activeTab === 'blog' ? classes.tabActive : ''}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog Posts
        </button>
        <button
          className={`${classes.tab} ${activeTab === 'products' ? classes.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
      </div>
      <div className={classes.content}>
        {activeTab === 'blog' && (
          <BlogPostEditorProvider>
            <BlogPostCreator />
            <ShowBlogPosts />
          </BlogPostEditorProvider>
        )}
        {activeTab === 'products' && <ProductManager />}
      </div>
    </div>
  );
};
