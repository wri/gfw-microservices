"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetListLockStatus = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetListLockStatus = class UspGetListLockStatus {
    async run(databaseName, { list_id }) {
        const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQuery('uspGetListLockStatus', parameters);
            connection.disconnect();
            console.log(recordsets);
            return recordsets;
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetListLockStatus = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetListLockStatus);
exports.UspGetListLockStatus = UspGetListLockStatus;
//# sourceMappingURL=uspGetListLockStatus.js.map