import type { CoverImageData } from './ProductInterface';

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  picture?: string | CoverImageData;
  email: string;
}