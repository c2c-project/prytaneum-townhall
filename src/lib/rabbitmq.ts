import ampq from 'amqplib';
import { ObjectId } from 'mongodb';

import env from 'config/env';
import net from 'lib/net';
import { TownhallForm } from 'db';

type ServerEvent = 'townhall-created' | 'townhall-updated' | 'townhall-deleted';

interface TownhallEmit {
    _id: ObjectId;
    datetime: string;
    description: string;
    speaker: string;
}

export const transformers = {
    Townhall: (form: TownhallForm, _id: ObjectId): TownhallEmit => {
        const { datetime, description, speaker } = form;
        return {
            _id,
            datetime,
            description,
            speaker,
        };
    },
};

let connection: ampq.Connection;

export const connect = net.buildRetryFn(async (): Promise<void> => {
    connection = await ampq.connect(env.AMQP_URL);
}, 'rabbitmq');

export async function emit<T = TownhallEmit>(
    event: 'townhall-created' | 'townhall-updated',
    data: T
): Promise<void>;
export async function emit<T = { _id: ObjectId }>(
    event: 'townhall-deleted',
    data: T
): Promise<void>;
export async function emit<T = TownhallEmit>(
    event: ServerEvent,
    data: T
): Promise<void> {
    try {
        const dataString = JSON.stringify(data);
        const channel = await connection.createChannel();
        await channel.assertQueue(event);
        channel.sendToQueue(event, Buffer.from(dataString));
    } catch (e) {
        await connect();
    }
}
