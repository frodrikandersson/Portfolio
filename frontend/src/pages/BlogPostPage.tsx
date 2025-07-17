import { useBlog } from '../contexts/BlogContext';
import classes from './Pages.module.css';

export const BlogPostPage = ({ postId }: { postId: string }) => {
    const { blogPosts } = useBlog();
    console.log('postId:', postId);
    console.log('blogPosts:', blogPosts);
    const post = blogPosts.find(p => p.id === postId);

    if (!post) return <div>Post not found</div>;

    return (
        <div className={classes.blogPost}>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
        </div>
    );
};
