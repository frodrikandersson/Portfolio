import { MongoClient, Db, ObjectId, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URL!;
const dbName = process.env.MONGO_DB_NAME || 'QuilCount';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  }
  return db!;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const database = await connectToDatabase();
  return database.collection<T>(name);
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}
 