import { BlogPostViewer } from '../components/BlogPostViewer/BlogPostViewer';

export const BlogPostPage = ({ postId }: { postId: string }) => {
  return <BlogPostViewer postId={postId} />;
};
