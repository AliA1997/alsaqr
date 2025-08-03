
// lib/mongodb.ts
import { Document, MongoClient, ServerApiVersion } from 'mongodb';

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PWD}@${process.env.MONGODB_URI}&appName=AlSaqr-Cluster`
console.log("mongodb url:", url);
let cachedClient: MongoClient;
let cachedDb: any;

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Document }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(url);
  const db = client.db(process.env.MONGODB_DB);
  await db.command({ ping: 1 });;
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
