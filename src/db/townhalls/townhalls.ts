import {
    Collection,
    UpdateQuery,
    FilterQuery,
    ObjectId,
    UpdateOneOptions
} from 'mongodb';
import Mongo from '../mongo';

export interface TownhallForm {
    datetime: string;
    speaker: string;
    description: string;
    moderator: string;
    url: string;
}

export interface TownhallSettings {
    chat: boolean;
}

export interface TownhallDoc {
    [index: string]: unknown;
    _id?: ObjectId;
    meta: {
        createdAt: Date;
        createdBy: NodeJS.User;
    };
    form: TownhallForm;
    settings: TownhallSettings;
    questions: string[];
}

function Townhalls() {
    let initialized = false;
    let collection: Collection<TownhallDoc>;

    const throwIfNotInitialized = () => {
        if (!initialized) {
            throw new Error('Not yet connected to DB');
        }
    };
    return {
        isInitialized() {
            return initialized;
        },
        async init(): Promise<void> {
            if (!initialized) {
                collection = await Mongo.collection<TownhallDoc>('users');
                initialized = true;
            }
        },
        async find(query?: FilterQuery<TownhallDoc>) {
            throwIfNotInitialized();
            return collection.find(query).toArray();
        },
        async insertOne(doc: TownhallDoc) {
            throwIfNotInitialized();
            return collection.insertOne(doc);
        },
        async updateOne(
            filter: FilterQuery<TownhallDoc>,
            update: UpdateQuery<TownhallDoc> | Partial<TownhallDoc>,
            options?: UpdateOneOptions | undefined
        ) {
            throwIfNotInitialized();
            return collection.updateOne(filter, update, options);
        },
    };
}

export default Townhalls();
