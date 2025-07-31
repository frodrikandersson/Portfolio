import {
  publicGetAllBlogPosts,
  publicGetBlogPostBySlug,
  privateCreateBlogPost,
  privateUpdateBlogPost,
  privateDeleteBlogPost
} from "../services/blogService";

export const handleGetAllBlogPosts = async () => {
  try {
    const data = await publicGetAllBlogPosts();
    console.log('Fetched blog posts:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching blog posts:', err.message);
    return null;
  }
};

export const handleGetBlogPostBySlug = async (slug: string) => {
  try {
    const data = await publicGetBlogPostBySlug(slug);
    console.log('Fetched blog post:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching blog post:', err.message);
    throw err;
  }
};

export const handleCreateBlogPost = async (postData: any) => {
  try {
    const data = await privateCreateBlogPost(postData);
    console.log('Created blog post:', data);
    return data;
  } catch (err: any) {
    console.error('Error creating blog post:', err.message);
    throw err;
  }
};

export const handleUpdateBlogPost = async (id: string, updateData: any) => {
  try {
    const data = await privateUpdateBlogPost(id, updateData);
    console.log('Updated blog post:', data);
    return data;
  } catch (err: any) {
    console.error('Error updating blog post:', err.message);
    throw err;
  }
};

export const handleDeleteBlogPost = async (id: string) => {
  try {
    const success = await privateDeleteBlogPost(id);
    console.log('Deleted blog post:', id);
    return success;
  } catch (err: any) {
    console.error('Error deleting blog post:', err.message);
    throw err;
  }
};
