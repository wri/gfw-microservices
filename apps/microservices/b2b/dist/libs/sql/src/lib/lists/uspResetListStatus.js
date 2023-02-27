"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspResetListStatus = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspResetListStatus = class UspResetListStatus {
    async run(databaseName, listId, listStatusId, gfwListId) {
        const parameters = [
            { field: 'list_id', type: sql.Int, value: listId },
            { field: 'status_id', type: sql.Int, value: listStatusId },
            { field: 'associated_gfwlist', type: sql.TinyInt, value: gfwListId },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspResetListStatus', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspResetListStatus = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspResetListStatus);
exports.UspResetListStatus = UspResetListStatus;
//# sourceMappingURL=uspResetListStatus.js.map