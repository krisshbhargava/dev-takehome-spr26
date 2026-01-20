import { getDb } from './mongodb';
import { Collection } from 'mongodb';
import { ItemRequestDoc } from './request';  // Changed import path and type name

export async function getRequestsCollection(): Promise<Collection<ItemRequestDoc>> {
  const db = await getDb();
  return db.collection<ItemRequestDoc>('requests');
}