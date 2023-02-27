"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetListLocations = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetListLocations = class UspGetListLocations {
    async run(databaseName, { listID, locationID, rowsRequested }) {
        const parameters = [
            { field: 'listID', type: sql.Int, value: listID },
            { field: 'locationID', type: sql.Int, value: locationID },
            {
                field: 'rowsRequested',
                type: sql.Int,
                value: rowsRequested,
            },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQueryArray('uspGetListLocations', parameters);
            connection.disconnect();
            return recordsets;
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetListLocations = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetListLocations);
exports.UspGetListLocations = UspGetListLocations;
//# sourceMappingURL=uspGetListLocations.js.map