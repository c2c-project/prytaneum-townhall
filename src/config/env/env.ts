import dotenv from 'dotenv';

dotenv.config();
const { env } = process;

export const defaults = {
    NODE_ENV: 'development',
    PORT: '3001',
    ORIGIN: 'localhost',
    DB_URL: 'mongodb://localhost:27017',
    AMQP_URL: 'amqp://rabbitmq:5672',
    PROPUBLICA_API_KEY: 'invalid_api_key',
} as Readonly<Required<NodeJS.ProcessEnv>>;

export function set(key: keyof NodeJS.ProcessEnv): string {
    const environmentVar = env[key];
    const envDefault = defaults[key];
    if (envDefault === undefined) {
        throw new Error('Provided invalid environment variable name');
    }
    if (environmentVar === undefined) {
        // eslint-disable-next-line no-console
        console.warn(
            `WARN: Environment variable "${key}" is not defined, using value "${envDefault}".\
            Please define "${key}" in your .env file`
        );
    }
    return environmentVar || envDefault;
}

const resilientEnv = {
    NODE_ENV: set('NODE_ENV'),
    PORT: set('PORT'),
    ORIGIN: set('ORIGIN'),
    DB_URL: set('DB_URL'),
    AMQP_URL: set('AMQP_URL'),
    PROPUBLICA_API_KEY: set('PROPUBLICA_API_KEY'),
} as Required<NodeJS.ProcessEnv>;

export default resilientEnv as Readonly<Required<NodeJS.ProcessEnv>>;

export const _test = {
    env: resilientEnv,
} as { env: NodeJS.ProcessEnv };
