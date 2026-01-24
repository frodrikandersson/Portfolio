import { useBlog } from '../../contexts/BlogContext';
import classes from './BlogPostViewer.module.css';

interface BlogPostViewerProps {
  postId: string;
}

export const BlogPostViewer = ({ postId }: BlogPostViewerProps) => {
  const { blogPosts, loading, error } = useBlog();

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error loading post: {error}</div>;

  const post = blogPosts.find(p => p._id === postId);
  if (!post) return <div>Post not found</div>;

  return (
    <div className={classes.post}>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className={classes.coverImage} loading="lazy" />
      )}

      <h1 className={classes.title}>{post.title}</h1>

      <div className={classes.meta}>
        <span>Published: {post.isPublished && post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
        <span> | Category: {post.category || 'Uncategorized'}</span>
        <span> | Views: {post.views ?? 0}</span>
      </div>

      {post.excerpt && <p className={classes.excerpt}><em>{post.excerpt}</em></p>}

      <div className={classes.content}>
        <p>{post.content}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className={classes.tags}>
          <strong>Tags:</strong>
          {post.tags.map(tag => (
            <span key={tag} className={classes.tag}>{tag}</span>
          ))}
        </div>
      )}

      {!post.commentsEnabled && (
        <p className={classes.commentsDisabled}>Comments are disabled for this post.</p>
      )}
    </div>
  );
};
