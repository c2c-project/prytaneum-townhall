import { ObjectId, Collection } from 'mongodb';
import { getCollection } from './mongo';

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

export default (): Collection<TownhallDoc> =>
    getCollection<TownhallDoc>('townhalls');
