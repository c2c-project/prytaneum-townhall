/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ObjectID } from 'mongodb';

import { emit, transformers } from 'lib/rabbitmq';
import Collections from 'db';
import { TownhallForm, TownhallSettings, Bill } from 'types';
import {
    getSubjectUrl,
    getBill,
    getBillUrls,
    getVoteResult,
} from 'lib/propublica';

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
) {
    return Collections.Townhalls().updateOne(
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
}

// TODO: extend this to write to a trash collection rather than actually delete
export function deleteTownhall(townhallId: string) {
    return Collections.Townhalls().deleteOne({
        _id: new ObjectID(townhallId),
    });
}

export function getTownhall(townhallId: string) {
    return Collections.Townhalls().findOne({ _id: new ObjectID(townhallId) });
}

export async function getBillInfo(townhallId: string) {
    const townhall = await Collections.Townhalls().findOne({
        _id: new ObjectID(townhallId),
    });

    if (!townhall) throw new Error('Invalid Townhall ID');

    const subject = await getSubjectUrl(townhall?.form.topic);
    const billUrls: string[] = await getBillUrls(subject);
    const allBills: Bill[] = [];
    for (let i = 0; i < billUrls.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        allBills.push(await getBill(billUrls[i]));
    }

    for (let i = 0; i < allBills.length; i += 1) {
        let houseVote = '';
        let senateVote = '';
        const houseObj = allBills[i].votes.find((o) => o.chamber === 'House');
        const senateObj = allBills[i].votes.find((o) => o.chamber === 'Senate');
        if (houseObj !== undefined) {
            // eslint-disable-next-line no-await-in-loop
            houseVote = await getVoteResult(
                houseObj?.api_url,
                townhall?.form.speaker
            );
        }

        if (senateObj !== undefined) {
            // eslint-disable-next-line no-await-in-loop
            senateVote = await getVoteResult(
                senateObj?.api_url,
                townhall?.form.speaker
            );
        }

        if (houseVote !== '') {
            allBills[i].vote_position = houseVote;
        } else if (senateVote !== '') {
            allBills[i].vote_position = senateVote;
        } else {
            allBills[i].vote_position = 'Not Found';
        }
    }

    return allBills;
}
