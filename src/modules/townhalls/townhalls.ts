/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ObjectID } from 'mongodb';

import { emit, transformers } from 'lib/rabbitmq';
import Collections from 'db';
import { TownhallForm, TownhallSettings, Bill } from 'types';
import { AxiosResponse } from 'axios';
import {
    getSubjectUrl,
    getBill,
    getBillUrls,
    getVoteResult,
    RollCallVoteResponse,
    getSenator,
    getCongressMan,
} from 'lib/propublica';
import { getPersonInfo, getLocalBills } from 'lib/openState';

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
// get determine vote position if the speaker is in house or senate, otherwise return not found
export function getVotePosition(
    billId: string,
    chamber: AxiosResponse<RollCallVoteResponse>[],
    speaker: string
) {
    for (let j = 0; j < chamber.length; j += 1) {
        if (chamber[j].data.results.votes.vote.bill.bill_id === billId) {
            for (
                let y = 0;
                y < chamber[j].data.results.votes.vote.positions.length;
                y += 1
            ) {
                if (
                    chamber[j].data.results.votes.vote.positions[y].name ===
                    speaker
                ) {
                    return chamber[j].data.results.votes.vote.positions[y]
                        .vote_position;
                }
            }
        }
    }

    return 'Not found';
}

export function getTownhall(townhallId: string) {
    return Collections.Townhalls().findOne({ _id: new ObjectID(townhallId) });
}

export async function getBillInfo(townhallId: string) {
    const townhall = await Collections.Townhalls().findOne({
        _id: new ObjectID(townhallId),
    });

    if (!townhall) throw new Error('Invalid Townhall ID');
    let isSenator = false;
    let isCongressMan = false;
    let isLocal = false;
    const senateMemberReponse = await getSenator();
    const congressMemberResponse = await getCongressMan();
    const localResponse = await getPersonInfo(townhall.form.speaker);

    const billResponses: Bill[] = [];
    for (
        let i = 0;
        i < congressMemberResponse.data.results[0].members.length;
        i += 1
    ) {
        const name = `${congressMemberResponse.data.results[0].members[i].first_name} ${congressMemberResponse.data.results[0].members[i].last_name}`;
        if (name === townhall.form.speaker) {
            isCongressMan = true;
        }
    }
    if (!isCongressMan) {
        for (
            let i = 0;
            i < senateMemberReponse.data.results[0].members.length;
            i += 1
        ) {
            const name = `${senateMemberReponse.data.results[0].members[i].first_name} ${senateMemberReponse.data.results[0].members[i].last_name}`;
            if (name === townhall.form.speaker) {
                isSenator = true;
            }
        }
    }
    if (localResponse.data.results.length !== 0) {
        isLocal = true;
    }
    if (isCongressMan || isSenator) {
        const subject = await getSubjectUrl(townhall.form.topic);
        const subjectData = subject.data.results[0].subjects[0].url_name; // get first subject url name based on townhall topic
        const billUrls = await getBillUrls(subjectData); // using subject url, we get a max of 20 recent bills related to subject
        const billArray = [];
        let billLimit = 0;
        if (billUrls.data.num_results !== 0) {
            billLimit =
                billUrls.data.num_results > 3 ? 3 : billUrls.data.num_results;
            for (let i = 0; i < billLimit; i += 1) {
                billArray.push(billUrls.data.results[i].bill_uri); // getting up to three bill urls
            }
        }

        const promises = billArray.map((url) => getBill(url)); // for each bill url we return bill info
        const allBills = await Promise.all(promises);
        let housePromise = [];
        let senatePromise = [];
        for (let i = 0; i < allBills.length; i += 1) {
            // extract desired bill info for each bill
            const object = {} as Bill;
            object.congressGovLink =
                allBills[i].data.results[0].congressdotgov_url;
            object.summary = allBills[i].data.results[0].summary;
            object.votes = allBills[i].data.results[0].votes;
            object.billId = allBills[i].data.results[0].bill_id;
            object.vote_position = 'Not found';
            billResponses.push(object);
        }
        const houseUrls = [];
        const senateUrls = [];
        let houseResponse: AxiosResponse<RollCallVoteResponse>[] = [];
        let senateResponse: AxiosResponse<RollCallVoteResponse>[] = [];

        for (let i = 0; i < billResponses.length; i += 1) {
            const houseObj = billResponses[i].votes.find(
                (vote) => vote.chamber === 'House' // find the first votes object with chamber house parameter
            );
            const senateObj = billResponses[i].votes.find(
                (vote) => vote.chamber === 'Senate' // find the first votes object with chamber senate parameter
            );
            if (houseObj?.api_url !== undefined) {
                houseUrls.push(houseObj.api_url); // get the corresponding votes api url
            }
            if (senateObj?.api_url !== undefined) {
                senateUrls.push(senateObj.api_url); // get the corresponding votes api url
            }
        }

        if (houseUrls.length !== 0) {
            housePromise = houseUrls.map((url) => getVoteResult(url)); // using the vote api url, we get vote response from House
            houseResponse = await Promise.all(housePromise);
        }

        if (senateUrls.length !== 0) {
            senatePromise = senateUrls.map((url) => getVoteResult(url)); // using the vote api url, we get vote response from Senate
            senateResponse = await Promise.all(senatePromise);
        }

        for (let i = 0; i < billResponses.length; i += 1) {
            // for each bill response object, we determine if the townhall speaker's vote position on that bill
            if (billResponses[i].vote_position === 'Not found') {
                billResponses[i].vote_position = getVotePosition(
                    billResponses[i].billId,
                    houseResponse,
                    townhall.form.speaker
                );
            }
        }
        for (let i = 0; i < billResponses.length; i += 1) {
            if (billResponses[i].vote_position === 'Not Found') {
                billResponses[i].vote_position = getVotePosition(
                    billResponses[i].billId,
                    senateResponse,
                    townhall.form.speaker
                );
            }
        }
    } else if (isLocal) {
        // if speaker is not in federal government but in a local government
        const jurisdiction = localResponse.data.results[0].jurisdiction.name;
        const lastName = townhall.form.speaker.split(' ').pop()?.toUpperCase();

        const localBillResponse = await getLocalBills(
            jurisdiction,
            townhall.form.topic
        ); // get bills based on jurisdiction and subject
        let localBillLimit = 0;

        if (localBillResponse.data.results.length > 0) {
            localBillLimit =
                localBillResponse.data.results.length > 3
                    ? 3
                    : localBillResponse.data.results.length; // up to three bills
        }
        for (let i = 0; i < localBillLimit; i += 1) {
            // extract desired bill info for each bill
            const object = {} as Bill;
            const summary1 = localBillResponse.data.results[i].title;

            let summary2 = '';
            if (
                localBillResponse.data.results[i].extras.impact_clause !==
                undefined
            ) {
                summary2 =
                    localBillResponse.data.results[i].extras.impact_clause;
            }

            object.summary =
                summary2.length > summary1.length ? summary2 : summary1; // summary will be the longer of the two attirbutes since each attirbute does not return consistent results

            if (localBillResponse.data.results[i].votes.length !== 0) {
                for (
                    let j = 0;
                    j < localBillResponse.data.results[i].votes.length;
                    j += 1
                ) {
                    for (
                        let y = 0;
                        y <
                        localBillResponse.data.results[i].votes[j].votes.length;
                        y += 1
                    ) {
                        const voteName =
                            localBillResponse.data.results[i].votes[j].votes[y]
                                .voter_name;
                        const firstWord = voteName.substr(
                            0,
                            voteName.indexOf(' ')
                        );
                        if (firstWord === lastName) { // api returns uppercase version of voter name and check if it equal to the upper case version of speaker
                            object.localVote =
                                localBillResponse.data.results[i].votes[
                                    j
                                ].votes;
                            object.vote_position =
                                localBillResponse.data.results[i].votes[
                                    j
                                ].votes[y].option;
                        }
                    }
                }
            } else {
                object.localVote = [];
            }
            object.billId = localBillResponse.data.results[i].id;
            billResponses.push(object);
        }
    } else { // if speaker is not found in washington or local government
        const object = {} as Bill;
        object.congressGovLink = 'null';
        object.summary = 'null';
        object.billId = 'null';
        object.vote_position = 'Not found';
        billResponses.push(object);
    }

    return billResponses;
}
