"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspDeleteList = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspDeleteList = class UspDeleteList {
    async run(databaseName, listName, listTable, listAnalysisTable) {
        const parameters = [
            { field: 'list_name', type: sql.NVarChar(150), value: listName },
            { field: 'list_table', type: sql.NVarChar(150), value: listTable },
            {
                field: 'analysis_table',
                type: sql.NVarChar(150),
                value: listAnalysisTable,
            },
        ];
        console.log(parameters);
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspDeleteList', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspDeleteList = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspDeleteList);
exports.UspDeleteList = UspDeleteList;
//# sourceMappingURL=uspDeleteList.js.map