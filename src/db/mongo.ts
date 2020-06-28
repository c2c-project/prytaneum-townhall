import { MongoClient, Db, Collection } from 'mongodb';

import config from 'config/mongo';
import net from 'lib/net';

const { dbName, url } = config;

let db: Db;
const client = new MongoClient(url, { useUnifiedTopology: true }).connect();

export const connectToMongo = net.buildRetryFn(async (): Promise<void> => {
    db = (await client).db(dbName);
}, 'mongo');

export function getDb(): Db {
    return db;
}

export function getCollection<T>(name: string): Collection<T> {
    return db.collection<T>(name);
}

export async function close(): Promise<void> {
    return (await client).close();
}
