import type { CoverImageData } from './ProductInterface';

export interface IMediaUsageRef {
  entityType: 'product' | 'blogpost' | 'user';
  entityId: string;
  field: string;
}

export interface IMediaFrontend extends CoverImageData {
  _id: string;
  originalFilename: string;
  title: string;
  altText: string;
  mimeType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  usageRefs: IMediaUsageRef[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMediaUpdate {
  title?: string;
  altText?: string;
}
