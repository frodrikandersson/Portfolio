import { MongoClient, Db, ObjectId, Collection, Document } from 'mongodb';
import { env } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (!client) {
    client = new MongoClient(env.MONGO_URL);
    await client.connect();
    db = client.db(env.MONGO_DB_NAME);
    console.log(`Connected to MongoDB: ${env.MONGO_DB_NAME}`);
    await ensureIndexes(db);
  }
  return db!;
}

async function ensureIndexes(db: Db): Promise<void> {
  await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ googleId: 1 }, { sparse: true });
  await db.collection('blogposts').createIndex({ slug: 1 }, { unique: true });
  await db.collection('blogposts').createIndex({ createdAt: -1 });
  await db.collection('consents').createIndex({ userId: 1 }, { unique: true });
  await db.collection('products').createIndex({ slug: 1 }, { unique: true });
  await db.collection('products').createIndex({ isPublished: 1, createdAt: -1 });
  await db.collection('products').createIndex({ category: 1 });
  await db.collection('purchases').createIndex({ userId: 1, productId: 1 }, { unique: true });
  await db.collection('purchases').createIndex({ userId: 1 });
  await db.collection('purchases').createIndex({ stripeSessionId: 1 }, { sparse: true });
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const database = await connectToDatabase();
  return database.collection<T>(name);
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}
