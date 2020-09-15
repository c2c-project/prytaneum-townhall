// propublica api

import axios, { AxiosPromise } from 'axios';
import env from 'config/env';

export function getSubjectUrl(topic: string): AxiosPromise<Response> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/search.json?query=${topic}`;
    return axios.get<Response>(apiUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}

export function getBillUrls(subjectUrl: string): AxiosPromise<Response> {
    const apiUrl = `https://api.propublica.org/congress/v1/bills/subjects/${subjectUrl}.json`;
    return axios.get<Response>(apiUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}

export function getBill(billUrl: string): AxiosPromise<Response> {
    return axios.get<Response>(billUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}
export function getVoteResult(voteUrl: string): AxiosPromise<Response> {
    return axios.get<Response>(voteUrl, {
        headers: { 'X-API-Key': env.PROPUBLICA_API_KEY },
    });
}
