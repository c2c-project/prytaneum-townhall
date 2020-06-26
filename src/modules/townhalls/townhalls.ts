import {
    InsertOneWriteOpResult,
    WithId,
    ObjectID,
    UpdateWriteOpResult,
} from 'mongodb';

import Townhall, {
    TownhallForm,
    TownhallSettings,
    TownhallDoc,
} from 'db/townhalls';

export async function createTownhall(
    form: TownhallForm,
    user: NodeJS.User
): Promise<InsertOneWriteOpResult<WithId<TownhallDoc>>> {
    const meta = {
        createdAt: new Date(),
        createdBy: user,
    };
    const initialSettings: TownhallSettings = { chat: false };
    return Townhall.insertOne({
        form,
        meta,
        settings: initialSettings,
        questions: [],
    });
}

export async function updateTownhall(
    form: TownhallForm,
    user: NodeJS.User,
    townhallId: string
): Promise<UpdateWriteOpResult> {
    return Townhall.updateOne(
        { _id: new ObjectID(townhallId) },
        {
            $set: {
                'meta.updatedAt': new Date(),
                'meta.updatedBy': user,
                form,
            },
        }
    );
}

export function deleteTownhall(townhallId: string, user: NodeJS.User) {

}
