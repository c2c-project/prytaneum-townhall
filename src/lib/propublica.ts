// propublica api

import axios from 'axios';

type Vote = {
    chamber: string;
    date: string;
    time: string;
    roll_call: string;
    question: string;
    results: string;
    total_yes: number;
    total_no: number;
    total_not_voting: number;
    api_url: string;
};

export function getSubjectUrl(topic: string): Promise<string> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/search.json?query=${topic}`;
    return axios
        .get(apiUrl, {
            headers: {
                'X-API-Key': process.env.PROPUBLICA_API_KEY,
            },
        })
        .then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return response.data.results[0].subjects[0].url_name as string;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}

export function getBillUrls(subjectUrl: string): Promise<string[]> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/${subjectUrl}.json`;
    let billLimit = 0;
    const billUrls: string[] = [];
    return axios
        .get(apiUrl, {
            headers: {
                'X-API-Key': process.env.PROPUBLICA_API_KEY,
            },
        })
        .then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (response.data.num_results !== 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                billLimit =
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    response.data.num_results > 3
                        ? 3
                        : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        response.data.num_results;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                for (let i = 0; i < billLimit; i += 1) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    billUrls.push(response.data.results[i].bill_uri);
                }
            }
            return billUrls;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}
export function getBill(
    billUrl: string
): Promise<{
        summary: string;
        congressGovLink: string;
        votes: Vote[];
        vote_position: string;
    }> {
    const billInfo = {} as Promise<{
        summary: string;
        congressGovLink: string;
        votes: Vote[];
        vote_position: string;
    }>;

    return axios
        .get(billUrl, {
            headers: {
                'X-API-Key': process.env.PROPUBLICA_API_KEY,
            },
        })
        .then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (response.data.status === 'OK') {
                billInfo.summary = response.data.results[0].summary;
                billInfo.congressGovLink =
                    response.data.results[0].congressdotgov_url;
                billInfo.votes = response.data.results[0].votes;
            }
            return billInfo;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}
export function getVoteResult(
    voteUrl: string,
    speaker: string
): Promise<string> {
    let vote = '';

    return axios
        .get(voteUrl, {
            headers: {
                'X-API-Key': process.env.PROPUBLICA_API_KEY,
            },
        })
        .then((response) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (response.data.status === 'OK') {
                for (
                    let i = 0;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    i < response.data.results.votes.vote.positions.length;
                    i += 1
                ) {
                    if (
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        response.data.results.votes.vote.positions[i].name ===
                        speaker
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        vote =
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            response.data.results.votes.vote.positions[i]
                                .vote_position;
                    }
                }
            }
            return vote;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}
