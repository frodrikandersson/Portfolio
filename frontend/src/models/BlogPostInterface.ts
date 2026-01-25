import type { CoverImageData } from './ProductInterface';

export interface IBlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string | CoverImageData;
  tags?: string[];
  category?: string;
  authorId: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  views?: number;
  commentsEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
}