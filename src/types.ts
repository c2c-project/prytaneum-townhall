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

export interface Bill {
    summary: string;
    congressGovLink: string;
    votes: Vote[];
    vote_position: string;
    billId: string;
}

export interface Vote {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill
    chamber: string;
    date: string;
    time: string;
    roll_call: string;
    question: string;
    results: string;
    total_yes: number;
    total_no: number;
    total_not_voting: number;
    api_url: string;
}
