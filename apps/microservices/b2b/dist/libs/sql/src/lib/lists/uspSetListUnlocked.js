"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspSetListUnlocked = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspSetListUnlocked = class UspSetListUnlocked {
    async run(databaseName, list_id) {
        const parameters = [
            { field: 'list_id', type: sql.Int, value: list_id },
            { field: 'user_id', type: sql.NVarChar(150), value: undefined },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQuery('uspSetListUnlocked', parameters);
            connection.disconnect();
            return recordsets;
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspSetListUnlocked = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspSetListUnlocked);
exports.UspSetListUnlocked = UspSetListUnlocked;
//# sourceMappingURL=uspSetListUnlocked.js.map