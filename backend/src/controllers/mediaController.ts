import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ObjectId } from 'mongodb';
import { IMedia, IMediaUpdate } from '../interfaces/MediaInterface';
import { generateImageVariants, cleanupVariants, cleanupOriginal } from '../utils/imageVariants';
import { getUploadDir } from '../middlewares/imageUpload';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const DEFAULT_PAGE_SIZE = 50;

// Helper function for other controllers to create/update media records
export async function createOrUpdateMediaRecord(
  imageData: { baseName: string; originalExt: string; widths: number[]; path: string },
  file: Express.Multer.File,
  entityType: 'product' | 'blogpost' | 'user',
  entityId: string,
  field: string,
  uploadedBy: string,
  title?: string
): Promise<void> {
  try {
    const collection = await getCollection<IMedia>('media');

    // Check if media record already exists
    const existing = await collection.findOne({ baseName: imageData.baseName });
    if (existing) {
      // Add usage ref if not already present
      const hasRef = existing.usageRefs.some(
        ref => ref.entityType === entityType && ref.entityId === entityId
      );
      if (!hasRef) {
        await collection.updateOne(
          { _id: existing._id },
          { $push: { usageRefs: { entityType, entityId, field } } }
        );
      }
      return;
    }

    // Get file metadata
    const uploadDir = getUploadDir(imageData.path.replace('/uploads/', '').replace('/', ''));
    const filePath = path.join(uploadDir, `${imageData.baseName}${imageData.originalExt}`);

    let fileSize = 0;
    let dimensions = { width: 0, height: 0 };

    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      fileSize = stat.size;
      try {
        const meta = await sharp(filePath).metadata();
        dimensions = { width: meta.width || 0, height: meta.height || 0 };
      } catch { /* ignore */ }
    }

    const newMedia: IMedia = {
      baseName: imageData.baseName,
      originalExt: imageData.originalExt,
      widths: imageData.widths,
      path: imageData.path,
      originalFilename: file.originalname,
      title: title || path.basename(file.originalname, path.extname(file.originalname)),
      altText: '',
      mimeType: file.mimetype,
      fileSize,
      dimensions,
      usageRefs: [{ entityType, entityId, field }],
      uploadedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newMedia);
  } catch (err) {
    console.error('Error creating media record:', err);
    // Don't throw - media record creation is secondary to the actual upload
  }
}

// Helper to remove usage reference when entity is deleted or image is replaced
export async function removeMediaUsageRef(
  baseName: string,
  entityType: 'product' | 'blogpost' | 'user',
  entityId: string
): Promise<void> {
  try {
    const collection = await getCollection<IMedia>('media');
    await collection.updateOne(
      { baseName },
      { $pull: { usageRefs: { entityType, entityId } } }
    );
  } catch (err) {
    console.error('Error removing media usage ref:', err);
  }
}

// Get all media with pagination
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const collection = await getCollection<IMedia>('media');

    const [media, total] = await Promise.all([
      collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments({}),
    ]);

    res.json({ media, total, page, limit });
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

// Get single media item by ID
export const getMediaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  try {
    const collection = await getCollection<IMedia>('media');
    const media = await collection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

// Upload new media
export const uploadMedia = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const mediaDir = getUploadDir('media');
    const filePath = req.file.path;

    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    const stats = fs.statSync(filePath);

    // Generate responsive variants
    const imageData = await generateImageVariants(filePath, mediaDir, '/uploads/media/');

    const newMedia: IMedia = {
      baseName: imageData.baseName,
      originalExt: imageData.originalExt,
      widths: imageData.widths,
      path: imageData.path,
      originalFilename: req.file.originalname,
      title: path.basename(req.file.originalname, path.extname(req.file.originalname)),
      altText: '',
      mimeType: req.file.mimetype,
      fileSize: stats.size,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
      usageRefs: [],
      uploadedBy: user._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection<IMedia>('media');
    const result = await collection.insertOne(newMedia);
    newMedia._id = result.insertedId;

    res.status(201).json(newMedia);
  } catch (err) {
    console.error('Error uploading media:', err);
    res.status(500).json({ message: 'Failed to upload media' });
  }
};

// Update media metadata
export const updateMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, altText } = req.body as IMediaUpdate;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  try {
    const collection = await getCollection<IMedia>('media');

    const updateFields: Partial<IMedia> = { updatedAt: new Date() };
    if (typeof title === 'string') updateFields.title = title;
    if (typeof altText === 'string') updateFields.altText = altText;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (err) {
    console.error('Error updating media:', err);
    res.status(500).json({ message: 'Failed to update media' });
  }
};

// Delete media (with usage check)
export const deleteMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const force = req.query.force === 'true';

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  try {
    const collection = await getCollection<IMedia>('media');
    const media = await collection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    // Check if media is in use
    if (media.usageRefs.length > 0 && !force) {
      res.status(409).json({
        message: 'Media is in use',
        usageRefs: media.usageRefs,
      });
      return;
    }

    // Delete files from disk
    const uploadDir = getUploadDir(media.path.replace('/uploads/', '').replace('/', ''));
    cleanupOriginal(uploadDir, media.baseName, media.originalExt);
    cleanupVariants(uploadDir, media.baseName, media.widths);

    // Delete from database
    await collection.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: 'Media deleted' });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ message: 'Failed to delete media' });
  }
};

// Get media usage details
export const getMediaUsage = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  try {
    const collection = await getCollection<IMedia>('media');
    const media = await collection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    res.json({ usageRefs: media.usageRefs });
  } catch (err) {
    console.error('Error fetching media usage:', err);
    res.status(500).json({ message: 'Failed to fetch media usage' });
  }
};

// Link existing media to an entity (product, blogpost, user)
export const linkMediaToEntity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { entityType, entityId, field } = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  if (!['product', 'blogpost', 'user'].includes(entityType)) {
    res.status(400).json({ message: 'Invalid entity type' });
    return;
  }

  if (!ObjectId.isValid(entityId)) {
    res.status(400).json({ message: 'Invalid entity ID' });
    return;
  }

  try {
    const mediaCollection = await getCollection<IMedia>('media');
    const media = await mediaCollection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    // Build the CoverImageData to set on the entity
    const coverImageData = {
      baseName: media.baseName,
      originalExt: media.originalExt,
      widths: media.widths,
      path: media.path,
    };

    // Update the target entity
    const collectionName = entityType === 'product' ? 'products' : entityType === 'blogpost' ? 'blogposts' : 'users';
    const fieldName = field || (entityType === 'user' ? 'picture' : 'coverImage');

    const entityCollection = await getCollection(collectionName);

    // Get old image to remove usage ref
    const entity = await entityCollection.findOne({ _id: new ObjectId(entityId) });
    if (!entity) {
      res.status(404).json({ message: `${entityType} not found` });
      return;
    }

    // Remove old media usage ref if exists
    const oldImage = entity[fieldName];
    if (oldImage && typeof oldImage === 'object' && oldImage.baseName && oldImage.baseName !== media.baseName) {
      await removeMediaUsageRef(oldImage.baseName, entityType, entityId);
    }

    // Update entity with new cover image
    await entityCollection.updateOne(
      { _id: new ObjectId(entityId) },
      { $set: { [fieldName]: coverImageData, updatedAt: new Date() } }
    );

    // Add usage ref to media if not already present
    const hasRef = media.usageRefs.some(
      ref => ref.entityType === entityType && ref.entityId === entityId
    );
    if (!hasRef) {
      await mediaCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { usageRefs: { entityType, entityId, field: fieldName } },
          $set: { updatedAt: new Date() },
        }
      );
    }

    res.json({ message: 'Media linked successfully', coverImage: coverImageData });
  } catch (err) {
    console.error('Error linking media:', err);
    res.status(500).json({ message: 'Failed to link media' });
  }
};

// Sync existing images into Media collection (one-time migration)
export const syncExistingMedia = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const mediaCollection = await getCollection<IMedia>('media');
    const stats = { products: 0, blogs: 0, users: 0 };

    // Sync product covers
    const products = await getCollection('products');
    const allProducts = await products.find({}).toArray();
    for (const product of allProducts) {
      if (product.coverImage && typeof product.coverImage === 'object') {
        const cover = product.coverImage;
        const existing = await mediaCollection.findOne({ baseName: cover.baseName });
        if (!existing) {
          const uploadDir = getUploadDir('products');
          const filePath = path.join(uploadDir, `${cover.baseName}${cover.originalExt}`);
          let fileSize = 0;
          let dimensions = { width: 0, height: 0 };

          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            fileSize = stat.size;
            try {
              const meta = await sharp(filePath).metadata();
              dimensions = { width: meta.width || 0, height: meta.height || 0 };
            } catch { /* ignore */ }
          }

          await mediaCollection.insertOne({
            baseName: cover.baseName,
            originalExt: cover.originalExt,
            widths: cover.widths || [],
            path: cover.path || '/uploads/products/',
            originalFilename: `${cover.baseName}${cover.originalExt}`,
            title: product.title || cover.baseName,
            altText: '',
            mimeType: cover.originalExt === '.png' ? 'image/png' : cover.originalExt === '.webp' ? 'image/webp' : 'image/jpeg',
            fileSize,
            dimensions,
            usageRefs: [{ entityType: 'product', entityId: product._id.toString(), field: 'coverImage' }],
            uploadedBy: user._id.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          stats.products++;
        }
      }
    }

    // Sync blog covers
    const blogs = await getCollection('blogposts');
    const allBlogs = await blogs.find({}).toArray();
    for (const blog of allBlogs) {
      if (blog.coverImage && typeof blog.coverImage === 'object') {
        const cover = blog.coverImage;
        const existing = await mediaCollection.findOne({ baseName: cover.baseName });
        if (!existing) {
          const uploadDir = getUploadDir('blogs');
          const filePath = path.join(uploadDir, `${cover.baseName}${cover.originalExt}`);
          let fileSize = 0;
          let dimensions = { width: 0, height: 0 };

          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            fileSize = stat.size;
            try {
              const meta = await sharp(filePath).metadata();
              dimensions = { width: meta.width || 0, height: meta.height || 0 };
            } catch { /* ignore */ }
          }

          await mediaCollection.insertOne({
            baseName: cover.baseName,
            originalExt: cover.originalExt,
            widths: cover.widths || [],
            path: cover.path || '/uploads/blogs/',
            originalFilename: `${cover.baseName}${cover.originalExt}`,
            title: blog.title || cover.baseName,
            altText: '',
            mimeType: cover.originalExt === '.png' ? 'image/png' : cover.originalExt === '.webp' ? 'image/webp' : 'image/jpeg',
            fileSize,
            dimensions,
            usageRefs: [{ entityType: 'blogpost', entityId: blog._id.toString(), field: 'coverImage' }],
            uploadedBy: user._id.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          stats.blogs++;
        }
      }
    }

    // Sync user avatars
    const users = await getCollection('users');
    const allUsers = await users.find({}).toArray();
    for (const u of allUsers) {
      if (u.picture && typeof u.picture === 'object') {
        const avatar = u.picture;
        const existing = await mediaCollection.findOne({ baseName: avatar.baseName });
        if (!existing) {
          const uploadDir = getUploadDir('avatars');
          const filePath = path.join(uploadDir, `${avatar.baseName}${avatar.originalExt}`);
          let fileSize = 0;
          let dimensions = { width: 0, height: 0 };

          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            fileSize = stat.size;
            try {
              const meta = await sharp(filePath).metadata();
              dimensions = { width: meta.width || 0, height: meta.height || 0 };
            } catch { /* ignore */ }
          }

          await mediaCollection.insertOne({
            baseName: avatar.baseName,
            originalExt: avatar.originalExt,
            widths: avatar.widths || [],
            path: avatar.path || '/uploads/avatars/',
            originalFilename: `${avatar.baseName}${avatar.originalExt}`,
            title: `${u.firstName || ''} ${u.lastName || ''}`.trim() || avatar.baseName,
            altText: '',
            mimeType: avatar.originalExt === '.png' ? 'image/png' : avatar.originalExt === '.webp' ? 'image/webp' : 'image/jpeg',
            fileSize,
            dimensions,
            usageRefs: [{ entityType: 'user', entityId: u._id.toString(), field: 'picture' }],
            uploadedBy: user._id.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          stats.users++;
        }
      }
    }

    res.json({ message: 'Sync completed', synced: stats });
  } catch (err) {
    console.error('Error syncing media:', err);
    res.status(500).json({ message: 'Failed to sync media' });
  }
};
