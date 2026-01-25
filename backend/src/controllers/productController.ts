import { Request, Response } from 'express';
import { getCollection } from '../config/db';
import { ObjectId } from 'mongodb';
import { IProduct } from '../interfaces/ProductInterface';
import { IPurchase } from '../interfaces/PurchaseInterface';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { sanitizeSlug } from '../utils/slugUtils';
import { generateImageVariants, cleanupVariants, cleanupOriginal, CoverImageData } from '../utils/imageVariants';
import { createOrUpdateMediaRecord, removeMediaUsageRef } from './mediaController';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const uploadsProductDir = path.join(__dirname, '..', '..', 'uploads', 'products');

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const DEFAULT_PAGE_SIZE = 20;
const ALLOWED_CATEGORIES = ['plugin', 'template', 'tool', 'theme', 'other'];

// === PUBLIC ===

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const collection = await getCollection<IProduct>('products');

    const filter: Record<string, unknown> = { isPublished: true };
    if (category && ALLOWED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    res.json({ products, total, page, limit });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const collection = await getCollection<IProduct>('products');
    const product = await collection.findOne({ slug, isPublished: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error getting product by slug:', err);
    res.status(500).json({ message: 'Failed to get product' });
  }
};

// === AUTHENTICATED ===

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { productId } = req.body;
  const user = req.user;

  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }
  if (!productId || !ObjectId.isValid(productId)) {
    res.status(400).json({ message: 'Valid productId required' }); return;
  }

  try {
    const productCol = await getCollection<IProduct>('products');
    const product = await productCol.findOne({ _id: new ObjectId(productId), isPublished: true });
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }

    if (product.price === 0) {
      res.status(400).json({ message: 'Product is free, use download endpoint directly' }); return;
    }

    const purchaseCol = await getCollection<IPurchase>('purchases');
    const existing = await purchaseCol.findOne({
      userId: new ObjectId(user._id.toString()),
      productId: new ObjectId(productId),
      status: 'completed',
    });
    if (existing) {
      res.status(409).json({ message: 'Already purchased' }); return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        productId: productId,
      },
      line_items: [{
        price_data: {
          currency: 'sek',
          product_data: {
            name: product.title,
            description: product.description.slice(0, 500),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${env.FRONTEND_URL}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}?purchase=cancelled`,
    });

    await purchaseCol.updateOne(
      { userId: new ObjectId(user._id.toString()), productId: new ObjectId(productId) },
      {
        $set: {
          purchaseDate: new Date(),
          stripePaymentId: null,
          stripeSessionId: session.id,
          amount: product.price,
          status: 'pending',
        },
      },
      { upsert: true },
    );

    res.json({ checkoutUrl: session.url });
  } catch (err: unknown) {
    console.error('Error creating checkout session:', err instanceof Error ? err.message : err);
    res.status(500).json({ message: 'Failed to create checkout session. Please try again.' });
  }
};

export const verifyPurchase = async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const user = req.user;

  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }
  if (!sessionId) { res.status(400).json({ message: 'sessionId required' }); return; }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      res.status(400).json({ message: 'Payment not completed' }); return;
    }

    const purchaseCol = await getCollection<IPurchase>('purchases');
    await purchaseCol.updateOne(
      { stripeSessionId: sessionId },
      {
        $set: {
          status: 'completed',
          stripePaymentId: session.payment_intent as string,
          purchaseDate: new Date(),
        },
      },
    );

    res.json({ verified: true });
  } catch (err) {
    console.error('Error verifying purchase:', err);
    res.status(500).json({ message: 'Failed to verify purchase' });
  }
};

export const getMyPurchasedProductIds = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }

  try {
    const purchaseCol = await getCollection<IPurchase>('purchases');
    const purchases = await purchaseCol.find({
      userId: new ObjectId(user._id.toString()),
      status: 'completed',
    }).project({ productId: 1 }).toArray();

    const productIds = purchases.map(p => p.productId.toString());
    res.json({ productIds });
  } catch (err) {
    console.error('Error fetching purchased IDs:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};

export const getMyPurchases = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }

  try {
    const purchaseCol = await getCollection<IPurchase>('purchases');
    const productCol = await getCollection<IProduct>('products');

    const purchases = await purchaseCol.find({
      userId: new ObjectId(user._id.toString()),
      status: 'completed',
    }).sort({ purchaseDate: -1 }).toArray();

    const productIds = purchases.map(p => new ObjectId(p.productId.toString()));
    const products = productIds.length > 0
      ? await productCol.find({ _id: { $in: productIds } }).toArray()
      : [];
    const productMap = new Map(products.map(p => [p._id!.toString(), p]));

    const enriched = purchases.map(p => ({
      ...p,
      product: productMap.get(p.productId.toString()) || null,
    }));

    res.json({ purchases: enriched });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};

export const downloadProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const user = req.user;

  if (!user) { res.status(401).json({ message: 'Not authenticated' }); return; }
  if (!ObjectId.isValid(productId)) { res.status(400).json({ message: 'Invalid product ID' }); return; }

  try {
    const productCol = await getCollection<IProduct>('products');
    const product = await productCol.findOne({ _id: new ObjectId(productId) });
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }

    // Check access: free, has purchase, or has active subscription
    if (product.price > 0) {
      const hasSubscription = user.subscriptionStatus === 'active';
      if (!hasSubscription) {
        const purchaseCol = await getCollection<IPurchase>('purchases');
        const purchase = await purchaseCol.findOne({
          userId: new ObjectId(user._id.toString()),
          productId: new ObjectId(productId),
          status: 'completed',
        });
        if (!purchase) {
          res.status(403).json({ message: 'Purchase required' }); return;
        }
      }
    }

    const filePath = path.resolve(env.PRODUCT_FILES_DIR, path.basename(product.fileUrl));
    if (!filePath.startsWith(path.resolve(env.PRODUCT_FILES_DIR))) {
      res.status(403).json({ message: 'Access denied' }); return;
    }
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' }); return;
    }

    // Increment download count
    await productCol.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { downloadCount: 1 } }
    );

    // For free products, create a purchase record for library tracking
    if (product.price === 0) {
      const purchaseCol = await getCollection<IPurchase>('purchases');
      await purchaseCol.updateOne(
        { userId: new ObjectId(user._id.toString()), productId: new ObjectId(productId) },
        {
          $setOnInsert: {
            userId: new ObjectId(user._id.toString()),
            productId: new ObjectId(productId),
            purchaseDate: new Date(),
            stripePaymentId: null,
            stripeSessionId: null,
            amount: 0,
            status: 'completed' as const,
          },
        },
        { upsert: true }
      );
    }

    const ext = path.extname(product.fileUrl);
    const downloadFilename = `${product.slug}${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('Error downloading product:', err);
    res.status(500).json({ message: 'Failed to download product' });
  }
};

// === ADMIN ===

export const createProduct = async (req: Request, res: Response) => {
  const { title, description, price, category, platform, slug, isPublished } = req.body;
  const file = req.file;

  if (!title || !description || !slug) {
    res.status(400).json({ message: 'title, description, and slug are required' }); return;
  }
  if (!file) {
    res.status(400).json({ message: 'Product file is required' }); return;
  }
  if (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH) {
    res.status(400).json({ message: `Title must be under ${MAX_TITLE_LENGTH} characters` }); return;
  }
  if (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH) {
    res.status(400).json({ message: 'Description too long' }); return;
  }

  const sanitizedSlug = sanitizeSlug(slug);
  const parsedPrice = parseFloat(price) || 0;

  try {
    const collection = await getCollection<IProduct>('products');
    const existing = await collection.findOne({ slug: sanitizedSlug });
    if (existing) {
      res.status(409).json({ message: 'A product with this slug already exists' }); return;
    }

    const newProduct: IProduct = {
      title: title.trim(),
      slug: sanitizedSlug,
      description: description.trim(),
      price: Math.max(0, parsedPrice),
      category: (category || 'plugin').trim(),
      platform: (platform || 'general').trim(),
      fileUrl: file.filename,
      coverImage: '',
      isPublished: isPublished === 'true' || isPublished === true,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newProduct);
    newProduct._id = result.insertedId;
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, price, category, platform, slug, isPublished, coverImage } = req.body;

  if (!ObjectId.isValid(id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  if (!title || !description || !slug) {
    res.status(400).json({ message: 'title, description, and slug required' }); return;
  }

  const sanitizedSlug = sanitizeSlug(slug);

  try {
    const collection = await getCollection<IProduct>('products');
    const existing = await collection.findOne({ slug: sanitizedSlug, _id: { $ne: new ObjectId(id) } });
    if (existing) {
      res.status(409).json({ message: 'Slug already in use' }); return;
    }

    const updateData: Partial<IProduct> = {
      title: title.trim(),
      description: description.trim(),
      price: Math.max(0, parseFloat(price) || 0),
      category: (category || '').trim(),
      platform: (platform || '').trim(),
      slug: sanitizedSlug,
      isPublished: isPublished === 'true' || isPublished === true,
      updatedAt: new Date(),
    };
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (req.file) updateData.fileUrl = req.file.filename;

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    if (result.matchedCount === 0) { res.status(404).json({ message: 'Product not found' }); return; }

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) { res.status(400).json({ message: 'Invalid ID' }); return; }

  try {
    const collection = await getCollection<IProduct>('products');
    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }

    const filePath = path.resolve(env.PRODUCT_FILES_DIR, path.basename(product.fileUrl));
    if (filePath.startsWith(path.resolve(env.PRODUCT_FILES_DIR)) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Clean up cover image and variants
    if (product.coverImage) {
      if (typeof product.coverImage === 'object') {
        const cover = product.coverImage as CoverImageData;
        await removeMediaUsageRef(cover.baseName, 'product', id);
        cleanupOriginal(uploadsProductDir, cover.baseName, cover.originalExt);
        cleanupVariants(uploadsProductDir, cover.baseName, cover.widths);
      } else {
        const coverPath = path.join(uploadsProductDir, path.basename(product.coverImage));
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

export const uploadCoverImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  if (!ObjectId.isValid(id)) { res.status(400).json({ message: 'Invalid ID' }); return; }
  if (!req.file) { res.status(400).json({ message: 'Image required' }); return; }

  try {
    const collection = await getCollection<IProduct>('products');

    // Clean up old cover image variants if they exist
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (existing?.coverImage) {
      if (typeof existing.coverImage === 'object') {
        const old = existing.coverImage as CoverImageData;
        // Remove old media usage reference
        await removeMediaUsageRef(old.baseName, 'product', id);
        cleanupOriginal(uploadsProductDir, old.baseName, old.originalExt);
        cleanupVariants(uploadsProductDir, old.baseName, old.widths);
      } else {
        const oldFile = path.join(uploadsProductDir, path.basename(existing.coverImage));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
    }

    // Generate responsive variants
    const coverData = await generateImageVariants(req.file.path, uploadsProductDir, '/uploads/products/');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { coverImage: coverData, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) { res.status(404).json({ message: 'Product not found' }); return; }

    // Create media record
    if (user) {
      await createOrUpdateMediaRecord(coverData, req.file, 'product', id, 'coverImage', user._id.toString(), existing?.title);
    }

    res.json({ coverImage: coverData });
  } catch (err) {
    console.error('Error uploading cover:', err);
    // Fallback: if variant generation fails, save just the original URL
    if (req.file) {
      const fallbackUrl = `/uploads/products/${req.file.filename}`;
      try {
        const collection = await getCollection<IProduct>('products');
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { coverImage: fallbackUrl, updatedAt: new Date() } }
        );
        res.json({ coverImage: fallbackUrl });
        return;
      } catch { /* fall through */ }
    }
    res.status(500).json({ message: 'Failed to upload cover image' });
  }
};

// Admin: get all products (including unpublished)
export const adminGetAllProducts = async (_req: Request, res: Response) => {
  try {
    const collection = await getCollection<IProduct>('products');
    const products = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ products });
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};
