import { Collection } from 'mongodb';

import initTownhalls, { TownhallDoc } from './townhalls';
import { connectToMongo } from './mongo';

/**
 * re-export anything from the collection files
 */
export { close } from './mongo';
export { TownhallDoc, TownhallForm, TownhallSettings } from './townhalls';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let Townhalls: Collection<TownhallDoc>;

/**
 * connects to mongo and initializes collections
 */
export async function connect(): Promise<void> {
    await connectToMongo();
    // also need to declare collections
    Townhalls = initTownhalls();
}

export default {
    Townhalls: (): Collection<TownhallDoc> => Townhalls,
};
