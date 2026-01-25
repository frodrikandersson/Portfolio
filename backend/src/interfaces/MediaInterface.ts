import { ObjectId } from "mongodb";

export interface IMediaUsageRef {
  entityType: 'product' | 'blogpost' | 'user';
  entityId: string;
  field: string;
}

export interface IMedia {
  _id?: ObjectId | string;

  // File identity (compatible with CoverImageData)
  baseName: string;
  originalExt: string;
  widths: number[];
  path: string;

  // Additional metadata
  originalFilename: string;
  title: string;
  altText: string;
  mimeType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };

  // Usage tracking
  usageRefs: IMediaUsageRef[];

  // Audit
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMediaUpdate {
  title?: string;
  altText?: string;
}
