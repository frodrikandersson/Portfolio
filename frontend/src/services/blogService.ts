import { apiFetch } from './api';
import type { IBlogPost } from '../models/BlogPostInterface';

export const publicGetAllBlogPosts = async (page = 1, limit = 20) => {
  return apiFetch<{ posts: IBlogPost[] }>(`/blogs/public?page=${page}&limit=${limit}`);
};

export const publicGetBlogPostBySlug = async (slug: string) => {
  return apiFetch<IBlogPost>(`/blogs/public/${slug}`);
};

export const privateCreateBlogPost = async (postData: Record<string, unknown>) => {
  return apiFetch<IBlogPost>('/blogs/admin', {
    method: 'POST',
    body: postData,
  });
};

export const privateUpdateBlogPost = async (id: string, updateData: Record<string, unknown>) => {
  return apiFetch<IBlogPost>(`/blogs/admin/update/${id}`, {
    method: 'PATCH',
    body: updateData,
  });
};

export const privateDeleteBlogPost = async (id: string) => {
  await apiFetch(`/blogs/admin/delete/${id}`, {
    method: 'DELETE',
  });
};
