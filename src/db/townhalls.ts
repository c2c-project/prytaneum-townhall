import { ObjectId, Collection } from 'mongodb';

import { TownhallDoc } from 'types';
import { getCollection } from './mongo';

export default (): Collection<TownhallDoc> =>
    getCollection<TownhallDoc>('townhalls');
