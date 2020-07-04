import { MongoClient, Db, Collection } from 'mongodb';

import config from 'config/mongo';
import net from 'lib/net';

const { dbName, url } = config;

let db: Db;
const client = new MongoClient(url, {
    useUnifiedTopology: true,
}).connect();
export const connectToMongo = net.buildRetryFn(
    async (): Promise<void> => {
        db = (await client).db(dbName);
    },
    {
        key: 'mongodb',
    }
);

export function getDb(): Db {
    return db;
}

export async function mongoRetry<T>(fn: () => Promise<T>): Promise<T> {
    return net.retry(fn, {
        key: `mongo-${Math.random()}`,
        maxRetryCount: 2,
        intervalSeconds: 1,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onFailedTry: (_e: Error) => connectToMongo(),
    });
}

export function getCollection<T>(name: string): Collection<T> {
    return db.collection<T>(name);
}

export async function close(): Promise<void> {
    return (await client).close();
}
