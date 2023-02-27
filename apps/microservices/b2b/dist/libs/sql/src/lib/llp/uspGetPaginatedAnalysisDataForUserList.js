"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetPaginatedAnalysisDataForUserList = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetPaginatedAnalysisDataForUserList = class UspGetPaginatedAnalysisDataForUserList {
    async run(databaseName, filters) {
        const { analysisAreaMax, analysisAreaMin, country, geometry, listID, orderType, page, rowsPerPage, sortByAttribute, state, subState, locationLogic, locationIds, locationStatement, combinedColumns, searchString } = filters;
        const parameters = [
            { field: 'listID', type: sql.Int, value: listID },
            { field: 'PageNumber', type: sql.Int, value: page || 0 },
            { field: 'RowsOfPage', type: sql.Int, value: rowsPerPage || 0 },
            {
                field: 'OrderByColumn',
                type: sql.NVarChar,
                value: sortByAttribute || 'Location Name',
            },
            { field: 'Order', type: sql.NVarChar, value: orderType || 'ASC' },
            { field: 'SubState', type: sql.NVarChar, value: subState || null },
            { field: 'Country', type: sql.NVarChar, value: country || null },
            { field: 'State', type: sql.NVarChar, value: state || null },
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
            { field: 'LocationLogic', type: sql.NVarChar, value: locationLogic || null },
            { field: 'LocationIds', type: sql.NVarChar, value: locationIds || null },
            { field: 'LocationStatement', type: sql.NVarChar, value: locationStatement || null },
            { field: 'ColumnsToReturn', type: sql.NVarChar, value: combinedColumns || null },
            { field: 'SearchString', type: sql.NVarChar, value: searchString || null },
            { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const createListResult = await connection.executeQueryArray('uspGetPaginatedAnalysisDataForUserList', parameters);
            await connection.disconnect();
            return createListResult;
        }
        catch (error) {
            await connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetPaginatedAnalysisDataForUserList = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetPaginatedAnalysisDataForUserList);
exports.UspGetPaginatedAnalysisDataForUserList = UspGetPaginatedAnalysisDataForUserList;
//# sourceMappingURL=uspGetPaginatedAnalysisDataForUserList.js.map