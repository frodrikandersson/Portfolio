export interface IBlogPost {
  id: string;
  title: string;
  content: string;
  slug: string; 
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}