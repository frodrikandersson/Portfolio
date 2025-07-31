import { useBlog } from '../../contexts/BlogContext';
import classes from './ShowBlogPosts.module.css';
import { useBlogPostEditor } from '../../hooks/useBlogPostEditor';

export const ShowBlogPosts = () => {
  const { blogPosts, deletePost } = useBlog();
  const { startEditing } = useBlogPostEditor();

  if (!blogPosts.length) {
    return <p className={classes.empty}>No blog posts yet.</p>;
  }

  return (
    <ul className={classes.postList}>
      {blogPosts.map(post => (
        <li className={classes.postItem} key={post._id}>
          <strong>{post.title}</strong>
          <p>{post.excerpt || post.content?.slice(0, 100)}...</p>
          <div className={classes.actionButtons}>
            <button
              onClick={() => startEditing(post)}
              className={classes.editButton}
            >
              Edit
            </button>
            <button
              onClick={() => deletePost(post._id!)}
              className={classes.deleteButton}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
