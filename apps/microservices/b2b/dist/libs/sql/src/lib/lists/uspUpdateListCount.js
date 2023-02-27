"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspUpdateListCount = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspUpdateListCount = class UspUpdateListCount {
    async run(databaseName, tableName, listId) {
        const parameters = [
            {
                field: 'table_name',
                type: sql.NVarChar(150),
                value: tableName,
            },
            { field: 'list_id', type: sql.Int, value: listId },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspUpdateListCount', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspUpdateListCount = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspUpdateListCount);
exports.UspUpdateListCount = UspUpdateListCount;
//# sourceMappingURL=uspUpdateListCount.js.map