export declare const SqlConfig: {
    user: string;
    password: string;
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
};
