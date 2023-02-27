"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPSListCreation = void 0;
const tslib_1 = require("tslib");
const sql_utils_1 = require("../util/sql.utils");
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const shared_1 = require("@wri-monorepos/shared");
const process = require("process");
const PENDING_STATUS_ID = 1;
const DRAFT_STATUS_ID = 4;
let SPSListCreation = class SPSListCreation {
    async createNewList(list_name, template_id, location_classification, user_id, custom_attributes, clientDatabase, gfw_list_id, saveAsDraft) {
        const list = (0, shared_1.CreateListNameSchema)(list_name);
        const list_table = list.list_table;
        const analysis_table = list.analysis_table;
        const list_status_id = saveAsDraft ? DRAFT_STATUS_ID : PENDING_STATUS_ID;
        const custom_attribute_names = '';
        const custom_attribute_types = '';
        let createListResult;
        const gfwProDatabase = process.env.MSSQL_DATABASE;
        const sqlClientConfig = {
            user: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            database: clientDatabase,
            server: process.env.MSSQL_HOSTNAME,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
            port: parseInt(process.env.MSSQL_PORT),
            options: {
                trustServerCertificate: true,
            },
        };
        const sqlMainConfig = {
            user: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            database: gfwProDatabase,
            server: process.env.MSSQL_HOSTNAME,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
            port: parseInt(process.env.MSSQL_PORT),
            options: {
                trustServerCertificate: true,
            },
        };
        const parameters = [
            { field: 'user_id', type: sql.Int, value: user_id },
            { field: 'template_id', type: sql.Int, value: template_id },
            { field: 'list_name', type: sql.NVarChar(150), value: list_name },
            {
                field: 'list_table_name',
                type: sql.NVarChar(150),
                value: list_table,
            },
            {
                field: 'list_analysis_table_name',
                type: sql.NVarChar(150),
                value: analysis_table,
            },
            { field: 'list_status_id', type: sql.Int, value: list_status_id },
            {
                field: 'location_classification',
                type: sql.NVarChar(150),
                value: location_classification,
            },
            {
                field: 'custom_attribute_names',
                type: sql.NVarChar(2000),
                value: custom_attribute_names,
            },
            {
                field: 'custom_attribute_types',
                type: sql.NVarChar(2000),
                value: custom_attribute_types,
            },
            { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
        ];
        let clientConnection = new sql_utils_1.SQLUtils(sqlClientConfig);
        await clientConnection.connect();
        try {
            createListResult = await clientConnection.executeQuery('uspCreateList', parameters);
            await clientConnection.executeQuery('uspAddListToAnalyses', [
                {
                    field: 'list_id',
                    type: sql.Int,
                    value: createListResult.list_id,
                },
            ]);
            await clientConnection.disconnect();
            const mainConnection = new sql_utils_1.SQLUtils(sqlMainConfig);
            await mainConnection.connect();
            const queryCreateTableResult = await mainConnection.executeQuery('uspGetTableQueryString', [
                {
                    field: 'template_id',
                    type: sql.Int,
                    value: template_id,
                },
                {
                    field: 'custom_attribute_1',
                    type: sql.NVarChar(50),
                    value: null,
                },
                {
                    field: 'custom_attribute_1_type',
                    type: sql.NVarChar(50),
                    value: null,
                },
                {
                    field: 'custom_attribute_2',
                    type: sql.NVarChar(50),
                    value: null,
                },
                {
                    field: 'custom_attribute_2_type',
                    type: sql.NVarChar(50),
                    value: null,
                },
                {
                    field: 'custom_attribute_3',
                    type: sql.NVarChar(50),
                    value: null,
                },
                {
                    field: 'custom_attribute_3_type',
                    type: sql.NVarChar(50),
                    value: null,
                },
            ]);
            clientConnection = new sql_utils_1.SQLUtils(sqlClientConfig);
            await clientConnection.connect();
            await clientConnection.executeQuery('uspCreateListTable', [
                {
                    field: 'table_name',
                    type: sql.NVarChar(150),
                    value: list.list_table,
                },
                {
                    field: 'query_string',
                    type: sql.NVarChar(sql.MAX),
                    value: queryCreateTableResult.query_string,
                },
            ]);
            await clientConnection.executeQuery('uspCreateAnalysisTable', [
                {
                    field: 'list_analysis_table_name',
                    type: sql.NVarChar(150),
                    value: list.analysis_table,
                },
            ]);
            return createListResult;
        }
        catch (error) {
            await clientConnection.executeQuery('uspDropOrganizationTable', [
                {
                    field: 'table_name',
                    type: sql.NVarChar,
                    value: list.list_table,
                },
            ]);
            await clientConnection.executeQuery('uspDropOrganizationTable', [
                {
                    field: 'table_name',
                    type: sql.NVarChar,
                    value: list.analysis_table,
                },
            ]);
            console.log(error);
            return error;
        }
    }
};
SPSListCreation = tslib_1.__decorate([
    (0, common_1.Injectable)()
], SPSListCreation);
exports.SPSListCreation = SPSListCreation;
//# sourceMappingURL=listCreation.js.map