"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetLocationsFilteredToCopy = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetLocationsFilteredToCopy = class UspGetLocationsFilteredToCopy {
    async run(databaseName, { listID, selectedLocations, country, state, subState, analysisAreaMin, analysisAreaMax, searchString, }) {
        const parameters = [
            { field: 'listID', type: sql.Int, value: listID },
            {
                field: 'SelectedLocations',
                type: sql.VarChar,
                value: selectedLocations,
            },
            { field: 'Country', type: sql.NVarChar, value: country || null },
            { field: 'State', type: sql.NVarChar, value: state || null },
            { field: 'SubState', type: sql.NVarChar, value: subState || null },
            {
                field: 'AnalysisAreaMin',
                type: sql.Int,
                value: analysisAreaMin || null,
            },
            {
                field: 'AnalysisAreaMax',
                type: sql.Int,
                value: analysisAreaMax || null,
            },
            {
                field: 'SearchString',
                type: sql.NVarChar,
                value: searchString || null,
            },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQueryArray('uspGetLocationsFilteredToCopy', parameters);
            connection.disconnect();
            return recordsets;
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetLocationsFilteredToCopy = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetLocationsFilteredToCopy);
exports.UspGetLocationsFilteredToCopy = UspGetLocationsFilteredToCopy;
//# sourceMappingURL=uspGetLocationsFilteredToCopy.js.map