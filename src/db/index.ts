import { Collection } from 'mongodb';

import initTownhalls, { TownhallDoc } from './townhalls';
import initQuestions, { QuestionDoc } from './questions';
import { connectToMongo } from './mongo';

/**
 * re-export anything from the collection files
 */
export { close, mongoRetry } from './mongo';
export { TownhallDoc, TownhallForm, TownhallSettings } from './townhalls';
export { QuestionDoc, QuestionForm } from './questions';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let Townhalls: Collection<TownhallDoc>;
let Questions: Collection<QuestionDoc>;

/**
 * connects to mongo and initializes collections
 */
export async function connect(): Promise<void> {
    await connectToMongo();
    // also need to declare collections
    Townhalls = initTownhalls();
    Questions = initQuestions();
}

type CreateMeta = {
    createdAt: string;
    createdBy: NodeJS.User;
};

/**
 * @returns a meta object to add to the target object for insertion into the database
 */
export function createMeta(creator: NodeJS.User): CreateMeta {
    return {
        createdAt: new Date().toISOString(),
        createdBy: creator,
    };
}

/**
 * @returns the appropriate mongo
 */
export function updateMetaQuery(updater: NodeJS.User): Record<string, unknown> {
    return {
        'meta.updatedBy': updater,
        'meta.updatedAt': new Date().toISOString(),
    };
}

export default {
    Townhalls: (): Collection<TownhallDoc> => Townhalls,
    Questions: (): Collection<QuestionDoc> => Questions,
};
