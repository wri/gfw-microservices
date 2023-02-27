"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspSetListLocked = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspSetListLocked = class UspSetListLocked {
    async run(databaseName, listId, userId) {
        console.log('userid', userId);
        const parameters = [
            { field: 'list_id', type: sql.Int, value: listId },
            {
                field: 'user_id',
                type: sql.Int,
                value: userId,
            },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspSetListLocked', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspSetListLocked = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspSetListLocked);
exports.UspSetListLocked = UspSetListLocked;
//# sourceMappingURL=uspSetListLocked.js.map