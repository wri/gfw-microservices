"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlConfig = void 0;
exports.SqlConfig = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
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
};
//# sourceMappingURL=config.js.map