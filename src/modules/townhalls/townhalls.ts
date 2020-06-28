import { ObjectID } from 'mongodb';

import { emit, transformers } from 'lib/rabbitmq';
import Collections, { TownhallForm, TownhallSettings } from 'db';

export async function createTownhall(
    form: TownhallForm,
    user: NodeJS.User
): Promise<void> {
    const defaultSettings: TownhallSettings = { chat: false };

    const {
        insertedCount,
        insertedId,
    } = await Collections.Townhalls().insertOne({
        form,
        meta: {
            createdAt: new Date(),
            createdBy: user,
        },
        settings: defaultSettings,
        questions: [],
    });

    if (insertedCount === 1) {
        await emit('townhall-created', transformers.Townhall(form, insertedId));
    } else {
        throw new Error('Unable to create townhall');
    }
}

export async function updateTownhall(
    form: TownhallForm,
    user: NodeJS.User,
    townhallId: string
): Promise<void> {
    const {
        modifiedCount,
        upsertedId,
    } = await Collections.Townhalls().updateOne(
        { _id: new ObjectID(townhallId) },
        {
            $set: {
                'meta.updatedAt': new Date(),
                'meta.updatedBy': user,
                form,
            },
        },
        {
            upsert: false,
        }
    );
    if (modifiedCount === 1) {
        await emit(
            'townhall-updated',
            transformers.Townhall(form, upsertedId._id)
        );
    } else if (modifiedCount > 1) {
        // TODO: make this more helpful
        throw new Error('Internal Error: Modified too many??');
    } else if (modifiedCount < 1) {
        throw new Error('Unable to update townhall');
    }
}

// TODO: extend this to write to a trash collection rather than actually delete
export async function deleteTownhall(
    townhallId: string,
    user: NodeJS.User
): Promise<void> {
    const { deletedCount } = await Collections.Townhalls().deleteOne({
        _id: new ObjectID(townhallId),
    });
    if (!deletedCount) {
        throw new Error('Unable to delete townhall');
    }

    if (deletedCount === 1) {
        await emit('townhall-deleted', { _id: new ObjectID(townhallId) });
    } else if (deletedCount < 1) {
        throw new Error('Unable to delete townhall');
    } else if (deletedCount > 1) {
        // TODO: make this more helpful
        throw new Error('Internal Error: Deleted too many??');
    }
}
