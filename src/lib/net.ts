/* eslint-disable no-console */
const MAX_RETRY_COUNT = 5;
const INTERVAL_SECONDS = 5;

/**
 * @arg options.onFailedTry only use this if you need to execute logic per try, ex. logging
 */
export const retry = <T = unknown>(
    fn: () => Promise<T>,
    options?: {
        onFailedTry?: (e: Error) => void;
    }
): Promise<T> => {
    let _options = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onFailedTry: (_e: Error) => {},
    };

    if (options) {
        _options = { ..._options, ...options };
    }

    return new Promise((resolve, reject) => {
        let count = 0;
        const checkPulse = () => {
            fn()
                .then((result) => {
                    resolve(result);
                })
                .catch((e) => {
                    count += 1;
                    if (count < MAX_RETRY_COUNT) {
                        _options.onFailedTry(e);
                        setTimeout(checkPulse, INTERVAL_SECONDS * 1000);
                    } else {
                        reject(e);
                    }
                });
        };
        checkPulse();
    });
};

/**
 * NOTE: this function is curried
 */
export const buildRetryFn = <T = unknown>(
    fn: () => Promise<T>,
    key?: string
) => async (): Promise<T> => {
    const defaultKey = '(NO KEY PROVIDED)';
    try {
        const value = await retry<T>(fn, {
            onFailedTry: () => {
                console.log(
                    `KEY: ${key || defaultKey} | RETRYING CONNECTION ...`
                );
            },
        });
        console.log(`KEY: ${key || defaultKey} | SUCCESSFULLY CONNECTED`);
        return value;
    } catch (e) {
        console.log(`KEY: ${key || defaultKey} | UNABLE TO CONNECT ...`);
        // be careful with this, throwing inside of a catch, I expect another catch that surrounds this
        throw e;
    }
};

export default {
    buildRetryFn,
    retry,
};
