import { ObjectId, Collection } from 'mongodb';
import { getCollection } from './mongo';

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

export default (): Collection<QuestionDoc> =>
    getCollection<QuestionDoc>('questions');
