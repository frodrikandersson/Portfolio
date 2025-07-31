import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Public: Get all published blog posts
export const publicGetAllBlogPosts = async () => {
  const res = await fetch(`${API_URL}/blogs/public`);
  const data = await res.json();
  return data;
};

// Public: Get single blog post by slug (also increments views)
export const publicGetBlogPostBySlug = async (slug: string) => {
  const res = await fetch(`${API_URL}/blogs/public/${slug}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch blog post');
  }

  return data;
};

// Private: Create a new blog post (requires token)
export const privateCreateBlogPost = async (postData: any) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');

  const res = await fetch(`${API_URL}/blogs/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify(postData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create blog post');
  }

  return data;
};

// Private: Update a blog post by ID
export const privateUpdateBlogPost = async (id: string, updateData: any) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');

  const res = await fetch(`${API_URL}/blogs/admin/update/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update blog post');
  }

  return data;
};

// Private: Delete a blog post by ID
export const privateDeleteBlogPost = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');

  const res = await fetch(`${API_URL}/blogs/admin/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete blog post');
  }

  return true;
};
