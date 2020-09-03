import { ObjectId } from 'mongodb';

// TODO: speaker type
interface Speaker {
    propublicaID: string;
}

export interface TownhallForm {
    datetime: string;
    speaker: string;
    description: string;
    moderator: string;
    url: string;
    topic: string;
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

export interface QuestionForm {
    question: string;
    anonymous: boolean;
}

export interface QuestionDoc {
    [index: string]: unknown;
    _id?: ObjectId;
    townhallId: ObjectId;
    form: QuestionForm;
    status: {
        isAsked: boolean;
        timestamp: string | null; // ISO
    };
}
