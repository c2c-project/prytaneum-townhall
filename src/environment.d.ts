declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: 'development' | 'production' | 'test';
            PORT?: string;
            ORIGIN?: string;
            DB_URL?: string;
            AMQP_URL?: string;
        }
        interface User {
            _id: string;
            name: {
                first: string;
                last: string;
            };
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
