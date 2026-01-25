import { apiFetch } from './api';
import type { IBlogPost } from '../models/BlogPostInterface';
import type { CoverImageData } from '../models/ProductInterface';

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

export const uploadBlogCover = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('cover', file);
  return apiFetch<{ coverImage: CoverImageData }>(`/blogs/admin/${id}/cover`, {
    method: 'POST',
    body: formData,
  });
};
