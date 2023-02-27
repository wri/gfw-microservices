"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetListNameSchema = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetListNameSchema = class UspGetListNameSchema {
    async run(databaseName, filters) {
        const { listID } = filters;
        const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQuery('uspGetListNameSchema', parameters);
            connection.disconnect();
            return recordsets;
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetListNameSchema = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetListNameSchema);
exports.UspGetListNameSchema = UspGetListNameSchema;
//# sourceMappingURL=uspGetListNameSchema.js.map