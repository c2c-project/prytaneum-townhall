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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = await getSubjectUrl(townhall?.form.topic);
    const subjectData = subject.data.results[0].subjects[0].url_name;
    const billUrls = await getBillUrls(subjectData);
    const billArray = [];
    let billLimit = 0;
    if (billUrls.data.num_results !== 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        billLimit =
            billUrls.data.num_results > 3 ? 3 : billUrls.data.num_results;

        for (let i = 0; i < billLimit; i += 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            billArray.push(billUrls.data.results[i].bill_uri);
        }
    }
    let allBills = [];
    const billResponses: Bill[] = [];
    const promises = billArray.map((url) => getBill(url));
    allBills = await Promise.all(promises);
    let promises3 = [];
    let promises4 = [];
    for (let i = 0; i < billArray.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const object = {} as Bill;
        object.congressGovLink = allBills[i].data.results[0].congressdotgov_url;
        object.summary = allBills[i].data.results[0].summary;
        object.votes = allBills[i].data.results[0].votes;
        object.billId = allBills[i].data.results[0].bill_id;
        object.vote_position = 'Not found';
        billResponses.push(object);
    }
    const houseUrls = [];
    const senateUrls = [];
    let houseResponse: string | any[] = [];
    let senateResponse: string | any[] = [];

    for (let i = 0; i < billResponses.length; i += 1) {
        const houseObj = billResponses[i].votes.find((o) => o.chamber === 'House');
        const senateObj = billResponses[i].votes.find((o) => o.chamber === 'Senate');
        if (houseObj?.api_url !== undefined) {
            houseUrls.push(houseObj?.api_url);
        }
        if (senateObj?.api_url !== undefined) {
            senateUrls.push(senateObj?.api_url);
        }
    }

    if (houseUrls.length !== 0) {
        promises3 = houseUrls.map((url) => getVoteResult(url));
        houseResponse = await Promise.all(promises3);
    }

    if (senateUrls.length !== 0) {
        promises4 = senateUrls.map((url) => getVoteResult(url));
        senateResponse = await Promise.all(promises4);
    }

    for (let i = 0; i < billResponses.length; i += 1) {
        for (let j = 0; j < houseResponse.length; j += 1) {
            if (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                houseResponse[j].data.results.votes.vote.bill.bill_id ===
                billResponses[i].billId
            ) {
              
                for (
                    let y = 0;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    y < houseResponse[j].data.results.votes.vote.positions.length;
                    y += 1
                ) {
                    if (
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        houseResponse[j].data.results.votes.vote.positions[y].name ===
                        townhall?.form.speaker
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        billResponses[i].vote_position =
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            houseResponse[j].data.results.votes.vote.positions[
                                y
                            ].vote_position;
                    }
                }
            }
        }
    }
    for (let i = 0; i < billResponses.length; i += 1) {
        for (let j = 0; j < senateResponse.length; j += 1) {
            if (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                senateResponse[j].data.results.votes.vote.bill.bill_id ===
                billResponses[i].billId
            ) {
              
                for (
                    let y = 0;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    y < senateResponse[j].data.results.votes.vote.positions.length;
                    y += 1
                ) {
                    if (
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        senateResponse[j].data.results.votes.vote.positions[y].name ===
                        townhall?.form.speaker
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        billResponses[i].vote_position =
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            senateResponse[j].data.results.votes.vote.positions[
                                y
                            ].vote_position;
                    }
                }
            }
        }
    }

  
    return billResponses;
}


