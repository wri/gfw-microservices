"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UspCopyLocationAnalysis = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const config_1 = require("../config/config");
let UspCopyLocationAnalysis = class UspCopyLocationAnalysis {
    async run(databaseName, { desListId, destLocationId, srcListId, srcLocationId, statement, }) {
        const parameters = [
            { field: 'dest_list_id', type: sql.Int, value: desListId },
            { field: 'dest_location_id', type: sql.Int, value: destLocationId },
            { field: 'src_list_id', type: sql.Int, value: srcListId },
            { field: 'src_location_id', type: sql.Int, value: srcLocationId },
            {
                field: 'statement',
                type: sql.VarChar,
                value: statement,
            },
        ];
        const connection = new sql_utils_1.SQLUtils(Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName }));
        await connection.connect();
        try {
            await connection.executeQuery('uspCopyLocationAnalysis', parameters);
            connection.disconnect();
        }
        catch (error) {
            connection.disconnect();
            throw new Error(error);
        }
    }
};
UspCopyLocationAnalysis = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UspCopyLocationAnalysis);
exports.UspCopyLocationAnalysis = UspCopyLocationAnalysis;
//# sourceMappingURL=uspCopyLocationAnalysis.js.map