import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BlogPostEditorProvider } from '../../contexts/BlogPostEditorContext';
import { BlogPostCreator } from '../BlogPostCreator/BlogPostCreator';
import { ShowBlogPosts } from '../ShowBlogPosts/ShowBlogPosts';
import { ProductManager } from '../ProductManager/ProductManager';
import { MediaLibrary } from '../MediaLibrary/MediaLibrary';
import { SEO } from '../SEO/SEO';
import classes from './AdminContent.module.css';

type AdminTab = 'blog' | 'products' | 'media';

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
      <SEO title="Admin Dashboard" noIndex />
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
        <button
          className={`${classes.tab} ${activeTab === 'media' ? classes.tabActive : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media
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
        {activeTab === 'media' && <MediaLibrary />}
      </div>
    </div>
  );
};
