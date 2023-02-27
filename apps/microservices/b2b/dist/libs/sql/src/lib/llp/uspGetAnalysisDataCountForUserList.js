"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspGetAnalysisDataCountForUserList = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspGetAnalysisDataCountForUserList = class UspGetAnalysisDataCountForUserList {
    async run(databaseName, filters) {
        const { country, listID, state, subState, rowsPerPage, analysisAreaMin, analysisAreaMax, searchString } = filters;
        const parameters = [
            { field: 'listID', type: sql.Int, value: listID },
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
            { field: 'SearchString', type: sql.Float, value: searchString || null },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            const recordsets = await connection.executeQuery('uspGetAnalysisDataCountForUserList', parameters);
            const numberOfPages = Math.ceil(recordsets[0].statistic / rowsPerPage);
            connection.disconnect();
            return numberOfPages;
        }
        catch (error) {
            console.log(error);
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspGetAnalysisDataCountForUserList = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspGetAnalysisDataCountForUserList);
exports.UspGetAnalysisDataCountForUserList = UspGetAnalysisDataCountForUserList;
//# sourceMappingURL=uspGetAnalysisDataCountForUserList.js.map