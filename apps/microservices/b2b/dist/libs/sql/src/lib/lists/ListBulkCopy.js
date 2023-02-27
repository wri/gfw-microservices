"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBulkCopy = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@wri-monorepos/shared");
const shared_2 = require("@wri-monorepos/shared");
const sql = require("mssql");
const sql_utils_1 = require("../util/sql.utils");
const config_1 = require("../config/config");
const common_1 = require("@nestjs/common");
let ListBulkCopy = class ListBulkCopy {
    async uploadBulkLocations(list_id, list_name, createTable, geojson, commodity, databaseName) {
        const clientConnectionConfiguration = Object.assign(Object.assign({}, config_1.SQL_CONFIG), { database: databaseName });
        const connection = new sql_utils_1.SQLUtils(clientConnectionConfiguration);
        await connection.connect();
        let primary_key = 1;
        let max_id = 0;
        const list = (0, shared_2.CreateListNameSchema)(list_name);
        const sqlGetMaxIdParameters = [
            { field: 'list_id', type: sql.Int, value: list_id },
        ];
        const maxIdResult = await connection.executeQuery('uspGetMaxId', sqlGetMaxIdParameters);
        max_id = maxIdResult.max_id === null ? 0 : maxIdResult.max_id;
        primary_key = maxIdResult.max_id === null ? 1 : maxIdResult.max_id + 1;
        const sqlGetTableColumnsParameters = [
            { field: 'list_id', type: sql.Int, value: list_id },
        ];
        const tableColumnsResult = await connection.executeQuery('uspGetTableColumns', sqlGetTableColumnsParameters);
        const columnNamesArray = [];
        const columnTypesArray = [];
        const dataArray = [];
        tableColumnsResult.forEach((column) => {
            if (column.COLUMN_NAME === 'location_id' ||
                column.COLUMN_NAME.includes('flag_')) {
                columnNamesArray.push(column.COLUMN_NAME);
                columnTypesArray.push(sql.Int);
            }
            else {
                columnNamesArray.push(column.COLUMN_NAME);
                columnTypesArray.push((0, shared_2.getDataType)(column.DATA_TYPE));
            }
        });
        geojson.features.forEach((feature) => {
            const featureArray = [];
            columnNamesArray.forEach((columnName) => {
                if ((0, shared_2.objectHasOwnProperty)(feature.properties, columnName)) {
                    featureArray.push(commodity && columnName === 'Commodity'
                        ? commodity
                        : feature.properties[columnName]);
                }
            });
            featureArray.push((0, shared_2.GetWKTGeometry)(feature.geometry), primary_key, 0, 0, 0, 0, 0, 0);
            primary_key += 1;
            dataArray.push(featureArray);
        });
        const objTable = new sql.Table(list.list_table);
        objTable.create = createTable;
        for (let nIndex = 0; nIndex < columnNamesArray.length; nIndex++) {
            objTable.columns.add(columnNamesArray[nIndex], columnTypesArray[nIndex], {
                nullable: true,
                primary: false,
            });
        }
        for (let nIndex = 0; nIndex < dataArray.length; nIndex++) {
            if (dataArray[nIndex].length === columnNamesArray.length) {
                objTable.rows.add(...dataArray[nIndex]);
            }
            else {
                throw new Error(`Length columns and properties do not match! Expected: ${columnNamesArray.length} Received: ${dataArray[nIndex].length}`);
            }
        }
        const bulkRequest = await new Promise((resolve, reject) => {
            const pool = new sql.ConnectionPool(clientConnectionConfiguration, (err) => {
                if (err) {
                    throw err;
                }
                const request = new sql.Request(pool);
                request
                    .bulk(objTable)
                    .then(() => {
                    resolve();
                })
                    .catch((errorMessage) => {
                    reject(errorMessage);
                });
            });
        });
        const sqlUpdateListCountParameters = [
            {
                field: 'table_name',
                type: sql.NVarChar(150),
                value: list.list_table,
            },
            { field: 'list_id', type: sql.Int, value: list_id },
        ];
        await connection.executeQuery('uspUpdateListCount', sqlUpdateListCountParameters);
        const sqlAddNewLocationToAnalysisTableParameters = [
            { field: 'list_id', type: sql.Int, value: list_id },
            { field: 'start_location_id', type: sql.Int, value: max_id },
        ];
        const recorsets = await connection.executeQueryArray('uspAddNewLocationToAnalysisTable', sqlAddNewLocationToAnalysisTableParameters);
        const resultGeoJson = (0, shared_1.createGeoJSON)(Array.isArray(recorsets) ? recorsets : [recorsets]);
        return resultGeoJson;
    }
};
ListBulkCopy = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ListBulkCopy);
exports.ListBulkCopy = ListBulkCopy;
//# sourceMappingURL=ListBulkCopy.js.map