import { Collection } from 'mongodb';

import { QuestionDoc } from 'types';
import { getCollection } from './mongo';

export default (): Collection<QuestionDoc> =>
    getCollection<QuestionDoc>('questions');
