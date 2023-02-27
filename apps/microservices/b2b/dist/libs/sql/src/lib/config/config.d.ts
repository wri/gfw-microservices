export declare const SQL_CONFIG: {
    user: string;
    password: string;
    database: string;
    server: string;
    pool: {
        max: number;
        min: number;
        idleTimeoutMillis: number;
    };
    port: number;
    options: {
        trustServerCertificate: boolean;
    };
    requestTimeout: number;
};
