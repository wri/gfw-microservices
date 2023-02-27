"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLUtils = void 0;
const connectionpool_1 = require("../connectionpool");
class SQLUtils {
    constructor(config) {
        this.config = config;
    }
    async connect() {
        this.connection = await (0, connectionpool_1.get)(this.config.database, this.config);
    }
    query(query, parameters) {
        const request = this.connection.request();
        if (parameters && Array.isArray(parameters)) {
            parameters.forEach((param) => {
                request.input(param.field, param.type, param.value);
            });
        }
        return new Promise((resolve, reject) => {
            request
                .query(query)
                .then((result) => {
                if (Number(result.recordsets.length) > 0) {
                    resolve(result.recordsets[0][0]);
                }
                resolve(undefined);
            })
                .catch((errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    executeQuery(query, parameters) {
        const request = this.connection.request();
        if (parameters && Array.isArray(parameters)) {
            parameters.forEach((param) => {
                request.input(param.field, param.type, param.value);
            });
        }
        return new Promise((resolve, reject) => {
            request
                .execute(query)
                .then((result) => {
                if (Number(result.recordsets.length) > 0) {
                    if (Number(result.recordsets[0].length) > 1) {
                        resolve(result.recordsets[0]);
                    }
                    resolve(result.recordsets[0][0]);
                }
                resolve(undefined);
            })
                .catch((errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    executeQueryArray(query, parameters) {
        const request = this.connection.request();
        if (parameters && Array.isArray(parameters)) {
            parameters.forEach((param) => {
                request.input(param.field, param.type, param.value);
            });
        }
        return new Promise((resolve, reject) => {
            request
                .execute(query)
                .then((result) => {
                if (Number(result.recordsets.length) > 0) {
                    resolve(result.recordsets[0]);
                }
                resolve(undefined);
            })
                .catch((errorMessage) => {
                reject(errorMessage);
            });
        });
    }
    disconnect() {
        return this.connection.close();
    }
}
exports.SQLUtils = SQLUtils;
//# sourceMappingURL=sql.utils.js.map