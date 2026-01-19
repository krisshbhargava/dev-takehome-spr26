import { getDb } from './mongodb';
import { Collection } from 'mongodb';
import { ItemRequest } from '../types/db/request';

export async function getRequestsCollection(): Promise<Collection<ItemRequest>> {
  const db = await getDb();
  return db.collection<ItemRequest>('requests');
}