import { ObjectId } from "mongodb";

export interface IProduct {
  _id?: ObjectId | string;
  title: string;
  slug: string;
  description: string;
  price: number; // 0 = free
  category: string;
  platform: string;
  fileUrl: string; // filename in product-files directory
  coverImage?: string;
  isPublished: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
