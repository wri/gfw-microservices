"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQL_CONFIG = void 0;
exports.SQL_CONFIG = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    server: process.env.MSSQL_HOSTNAME,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    port: parseInt(process.env.MSSQL_PORT),
    options: {
        trustServerCertificate: true,
    },
    requestTimeout: 600000,
};
//# sourceMappingURL=config.js.map