import { MongoClient, Db, Collection } from 'mongodb';
import config from 'config/mongo';

const { dbName, url } = config;

function Mongo() {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    const connect = () =>
        client
            .connect()
            .then((connection: MongoClient) => connection.db(dbName));

    let connection: Promise<Db> | undefined;

    return {
        connection,
        init() {
            connection = connect();
            return connection;
        },
        async collection<T>(name: string): Promise<Collection<T>> {
            if (!connection) {
                throw new Error('Not connected to the db yet');
            }
            const db = await connection;
            return db.collection<T>(name);
            // return connection.then((db) => db.collection(name));
        },
        close() {
            return client.close();
        },
    };
}

export default Mongo();
