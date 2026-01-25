import { useBlog } from '../../contexts/BlogContext';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import { SEO } from '../SEO/SEO';
import { getPostDateInfo } from '../../utils/formatPostDate';
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

  const dateInfo = getPostDateInfo(post.publishedAt, post.updatedAt, post.createdAt);

  return (
    <div className={classes.post}>
      <SEO
        title={post.title}
        description={post.excerpt || post.content?.slice(0, 160)}
        type="article"
      />
      {post.coverImage && (
        <ResponsiveImage
          coverImage={post.coverImage}
          alt={post.title}
          className={classes.coverImage}
          sizes="(max-width: 768px) 100vw, 800px"
        />
      )}

      <h1 className={classes.title}>
        {dateInfo.badge && (
          <span className={`${classes.badge} ${classes[dateInfo.badge]}`}>
            {dateInfo.badge.toUpperCase()}
          </span>
        )}
        {post.title}
      </h1>

      <div className={classes.meta}>
        <span>Published: {post.isPublished ? dateInfo.fullDate : 'Draft'}</span>
        {dateInfo.updatedFullDate && (
          <span> | Updated: {dateInfo.updatedFullDate}</span>
        )}
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
