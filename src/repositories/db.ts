import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
dotenv.config()

export type ProductType = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestrictions: number;
  createdAt: Date;
  publicationDate: Date;
}

export type VideoType = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: string;
  createdAt: Date;
  publicationDate: Date;
  availableResolutions: string[];
}

// Connection URL
const url = process.env.MONGO_URL
console.log('url :', url)
if (!url) {
  throw new Error('❗ Url doesn\'t found')
}
const client = new MongoClient(url);

export const productCollection = client.db('homework1').collection<ProductType>('products');
export const videosCollection = client.db('homework1').collection<VideoType>('videos');

export const runDb = async () => {
  try {
    await client.connect();
    console.log('✅ Connected successfully to server');
  } catch (e) {
    console.log('❗ Don\'t connected successfully to server');
    await client.close()
  }
};


