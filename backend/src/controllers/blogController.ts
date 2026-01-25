import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ObjectId } from 'mongodb';
import { IBlogPost } from '../interfaces/BlogInterface';
import { sanitizeSlug } from '../utils/slugUtils';
import { generateImageVariants, cleanupVariants, cleanupOriginal, CoverImageData } from '../utils/imageVariants';
import { getUploadDir } from '../middlewares/imageUpload';
import { createOrUpdateMediaRecord, removeMediaUsageRef } from './mediaController';

const DEFAULT_PAGE_SIZE = 20;

export const createBlogPost = async (req: Request, res: Response) => {
  const { title, content, slug, excerpt, coverImage, tags, category, isPublished, commentsEnabled } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const sanitizedSlug = sanitizeSlug(slug);

  try {
    const collection = await getCollection<IBlogPost>('blogposts');

    const existingPost = await collection.findOne({ slug: sanitizedSlug });
    if (existingPost) {
      res.status(409).json({ message: 'A post with this slug already exists' });
      return;
    }

    const newPost: IBlogPost = {
      title: title.trim(),
      content,
      slug: sanitizedSlug,
      excerpt: excerpt.slice(0, 500),
      coverImage,
      tags,
      category,
      authorId: user._id.toString(),
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      views: 0,
      commentsEnabled,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPost);
    newPost._id = result.insertedId.toString();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};

export const getAllBlogPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const collection = await getCollection<IBlogPost>('blogposts');
    const filter = { isPublished: true };

    const [posts, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    res.json({ posts, total, page, limit });
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const collection = await getCollection<IBlogPost>('blogposts');
    const post = await collection.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (err) {
    console.error('Error getting post by slug:', err);
    res.status(500).json({ message: 'Failed to get blog post' });
  }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const collection = await getCollection<IBlogPost>('blogposts');
    const post = await collection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Clean up cover image if exists
    if (post.coverImage && typeof post.coverImage === 'object') {
      const cover = post.coverImage as CoverImageData;
      const blogsUploadDir = getUploadDir('blogs');
      await removeMediaUsageRef(cover.baseName, 'blogpost', id);
      cleanupOriginal(blogsUploadDir, cover.baseName, cover.originalExt);
      cleanupVariants(blogsUploadDir, cover.baseName, cover.widths);
    }

    await collection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Blog post deleted' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, slug, excerpt, coverImage, tags, category, isPublished, commentsEnabled } = req.body;

  const sanitizedSlug = sanitizeSlug(slug);

  try {
    const collection = await getCollection<IBlogPost>('blogposts');

    const existingPost = await collection.findOne({ slug: sanitizedSlug, _id: { $ne: new ObjectId(id) } });
    if (existingPost) {
      res.status(409).json({ message: 'Another post with this slug already exists' });
      return;
    }

    const updateData: Partial<IBlogPost> = {
      title: title.trim(),
      content,
      slug: sanitizedSlug,
      excerpt: excerpt.slice(0, 500),
      coverImage,
      tags,
      category,
      isPublished,
      commentsEnabled,
      publishedAt: isPublished ? new Date() : null,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    const updatedPost = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
};

export const uploadBlogCover = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  if (!ObjectId.isValid(id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  if (!req.file) { res.status(400).json({ message: 'Image required' }); return; }

  const blogsUploadDir = getUploadDir('blogs');

  try {
    const collection = await getCollection<IBlogPost>('blogposts');

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) { res.status(404).json({ message: 'Blog post not found' }); return; }

    // Clean up old cover
    if (existing.coverImage && typeof existing.coverImage === 'object') {
      const old = existing.coverImage as CoverImageData;
      await removeMediaUsageRef(old.baseName, 'blogpost', id);
      cleanupOriginal(blogsUploadDir, old.baseName, old.originalExt);
      cleanupVariants(blogsUploadDir, old.baseName, old.widths);
    }

    const coverData = await generateImageVariants(req.file.path, blogsUploadDir, '/uploads/blogs/');

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { coverImage: coverData, updatedAt: new Date() } }
    );

    // Create media record
    if (user) {
      await createOrUpdateMediaRecord(coverData, req.file, 'blogpost', id, 'coverImage', user._id.toString(), existing.title);
    }

    res.json({ coverImage: coverData });
  } catch (err) {
    console.error('Error uploading blog cover:', err);
    if (req.file) {
      const fallbackUrl = `/uploads/blogs/${req.file.filename}`;
      try {
        const collection = await getCollection<IBlogPost>('blogposts');
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { coverImage: fallbackUrl, updatedAt: new Date() } }
        );
        res.json({ coverImage: fallbackUrl });
        return;
      } catch { /* fall through */ }
    }
    res.status(500).json({ message: 'Failed to upload blog cover' });
  }
};
