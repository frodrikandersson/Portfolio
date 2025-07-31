import { useBlog } from '../contexts/BlogContext';
import classes from './Pages.module.css';

export const BlogPostPage = ({ postId }: { postId: string }) => {
  const { blogPosts, loading, error } = useBlog();

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error loading post: {error}</div>;

  const post = blogPosts.find(p => p._id === postId);

  if (!post) return <div>Post not found</div>;

  return (
    <div className={classes.blogPost}>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className={classes.blogCoverImage} />
      )}
      
      <h1 className={classes.blogTitle}>{post.title}</h1>

      <div className={classes.blogMeta}>
        <span>Published: {post.isPublished && post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
        <span> | Category: {post.category || 'Uncategorized'}</span>
        <span> | Views: {post.views ?? 0}</span>
      </div>

      {post.excerpt && <p className={classes.blogExcerpt}><em>{post.excerpt}</em></p>}
      
      <div className={classes.blogContent}>
        <p>{post.content}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className={classes.blogTags}>
          <strong>Tags:</strong>
          {post.tags.map(tag => (
            <span key={tag} className={classes.blogTag}>{tag}</span>
          ))}
        </div>
      )}

      {!post.commentsEnabled && (
        <p className={classes.blogCommentsDisabled}>Comments are disabled for this post.</p>
      )}
    </div>
  );
};
