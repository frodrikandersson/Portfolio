import { BlogPostEditorProvider } from '../contexts/BlogPostEditorContext';
import { BlogPostCreator } from '../components/BlogPostCreator/BlogPostCreator';
import { ShowBlogPosts } from '../components/ShowBlogPosts/ShowBlogPosts';
import classes from './Pages.module.css';

export const AdminPage = () => {
  return (
    <div className={classes.adminPage}>
      <div className={classes.adminBlogWrapper}>
        <BlogPostEditorProvider>
          <h2 className={classes.adminBlogTitle}>Manage Blog Posts</h2>
          <BlogPostCreator />
          <ShowBlogPosts />
        </BlogPostEditorProvider>
      </div>
    </div>
  );
};
