// openState API

import axios, { AxiosPromise } from 'axios';
import env from 'config/env';
import { Vote } from 'types';

// https://v3.openstates.org/docs#/

export interface OpenStatePersonResponse {
    results: OpenStatePersonResponseResults[];
}
export interface OpenStatePersonResponseResults {
    name: string;
    jurisdiction: Jurisdiction;
}
export interface Jurisdiction {
    id: string;
    name: string;
    classification: string;
}

export interface OpenStateBillResponse {
    results: OpenStateBillResponseResults[];
}
export interface OpenStateBillResponseResults {
    votes: OpenStateBillResponseVotes[];
    extras: OpenStateBillExtras;
    title: string;
    id: string;
}
export interface OpenStateBillExtras {
    impact_clause: string;
}
export interface OpenStateBillResponseVotes {
    result: string;
    start_date: string;
    votes: OpenStateBillResponseVotesResults[];
}
export interface OpenStateBillResponseVotesResults {
    option: string;
    voter_name: string;
}

export function getPersonInfo(
    speaker: string
): AxiosPromise<OpenStatePersonResponse> {
    const uriName = encodeURIComponent(speaker);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const apiUrl = `https://v3.openstates.org/people?name=${uriName}&page=1&per_page=20&apikey=${env.OPEN_STATE_API_KEY}`;
    return axios.get<OpenStatePersonResponse>(apiUrl);
}
export function getLocalBills(
    jurisdiction: string,
    subject: string
): AxiosPromise<OpenStateBillResponse> {
    const uriName = encodeURIComponent(jurisdiction);
    const subjectName = encodeURIComponent(subject);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const apiUrl = `https://v3.openstates.org/bills?jurisdiction=${uriName}&classification=bill&subject=${subjectName}&include=votes&page=1&per_page=20&apikey=${env.OPEN_STATE_API_KEY}`;
    return axios.get<OpenStateBillResponse>(apiUrl);
}
