import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ObjectId } from 'mongodb';
import { IBlogPost } from '../interfaces/BlogInterface';

// Create a new blog post
export const createBlogPost = async (req: Request, res: Response) => {
  const {
    title,
    content,
    slug,
    excerpt,
    coverImage,
    tags,
    category,
    isPublished,
    commentsEnabled,
  } = req.body;

  const user = (req as any).user;

  if (!title || !content || !slug) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const collection = await getCollection<IBlogPost>('blogposts');
    const newPost: IBlogPost = {
      title,
      content,
      slug,
      excerpt: excerpt || '',
      coverImage: coverImage || '',
      tags: Array.isArray(tags) ? tags : [],
      category: category || '',
      authorId: user._id.toString(),
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,
      views: 0,
      commentsEnabled: commentsEnabled !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPost);

    // Attach the generated MongoDB _id to newPost
    newPost._id = result.insertedId.toString();

    // ✅ Return the full post to the frontend
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};


// Get all blog posts
export const getAllBlogPosts = async (_req: Request, res: Response) => {
  try {
    const collection = await getCollection<IBlogPost>('blogposts');
    const posts = await collection.find().sort({ createdAt: -1 }).toArray();
    res.json(posts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
};

// Get single blog post by slug
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

// Delete post (admin only)
export const deleteBlogPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  try {
    const collection = await getCollection<IBlogPost>('blogposts');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json({ message: 'Blog post deleted' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
};

// Update blog post (admin only)
export const updateBlogPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    content,
    slug,
    excerpt,
    coverImage,
    tags,
    category,
    isPublished,
    commentsEnabled,
  } = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (!title || !content || !slug) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const collection = await getCollection<IBlogPost>('blogposts');

    const updateData: Partial<IBlogPost> = {
      title,
      content,
      slug,
      excerpt: excerpt || '',
      coverImage: coverImage || '',
      tags: Array.isArray(tags) ? tags : [],
      category: category || '',
      isPublished: !!isPublished,
      commentsEnabled: commentsEnabled !== false,
      updatedAt: new Date(),
    };

    if (isPublished) {
      updateData.publishedAt = new Date();
    } else {
      updateData.publishedAt = null;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    const updatedPost = await collection.findOne({ _id: new ObjectId(id) });

    if (!updatedPost) {
      res.status(404).json({ message: 'Blog post not found after update' });
      return;
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
};