"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspDeleteLocation = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspDeleteLocation = class UspDeleteLocation {
    async run(databaseName, listId, locationId) {
        const parameters = [
            { field: 'list_id', type: sql.Int, value: listId },
            { field: 'location_id', type: sql.Int, value: locationId },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspDeleteLocation', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspDeleteLocation = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspDeleteLocation);
exports.UspDeleteLocation = UspDeleteLocation;
//# sourceMappingURL=uspDeleteLocation.js.map