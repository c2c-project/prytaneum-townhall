// propublica api

import axios, { AxiosPromise } from 'axios';
import env from 'config/env';
import { Vote } from 'types';

export interface PropublicaSubjectUrlResponse {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill-subject
    results: PropublicaSubjectResponseResults[];
}
export interface PropublicaSubjectResponseResults {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill-subject
    subjects: subjectArray[];
}

export interface subjectArray {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill-subject

    name: string;
    url_name: string;
}

export interface PropublicaBillUrlResponse {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-recent-bills-by-a-specific-subject
    results: PropublicaBillUrlResponseResults[];
    num_results: number;
}
export interface PropublicaBillUrlResponseResults {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-recent-bills-by-a-specific-subject

    bill_uri: string;
}

export interface PropublicaBillResponse {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill

    results: PropublicaBillResponseResults[];
}
export interface PropublicaBillResponseResults {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill

    congressdotgov_url: string;
    summary: string;
    bill_id: string;
    votes: Vote[];
}

export interface RollCallVoteResponse {
    // full interface can be found at https://projects.propublica.org/api-docs/congress-api/votes/#get-a-specific-roll-call-vote

    results: {
        votes: {
            vote: {
                bill: {
                    bill_id: string;
                };
                positions: {
                    member_id: string;
                    name: string;
                    party: string;
                    state: string;
                    vote_position: string;
                }[];
            };
        };
    };
}

export function getSubjectUrl(
    topic: string
): AxiosPromise<PropublicaSubjectUrlResponse> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/search.json?query=${topic}`;
    return axios.get<PropublicaSubjectUrlResponse>(apiUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}

export function getBillUrls(
    subjectUrl: string
): AxiosPromise<PropublicaBillUrlResponse> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/${subjectUrl}.json`;
    return axios.get<PropublicaBillUrlResponse>(apiUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}

export function getBill(billUrl: string): AxiosPromise<PropublicaBillResponse> {
    return axios.get<PropublicaBillResponse>(billUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}
export function getVoteResult(
    voteUrl: string
): AxiosPromise<RollCallVoteResponse> {
    return axios.get<RollCallVoteResponse>(voteUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}
