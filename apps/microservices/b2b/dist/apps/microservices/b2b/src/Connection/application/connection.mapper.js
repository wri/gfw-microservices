"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionDataMapper = void 0;
const class_transformer_1 = require("class-transformer");
const sql = require("mssql");
const connection_1 = require("../domain/connection");
class ConnectionDataMapper {
    static createConnectionDtotoConnection(connectionDto) {
        return (0, class_transformer_1.plainToInstance)(connection_1.Connection, connectionDto);
    }
    static toProcedureParam(connection) {
        const params = [
            {
                field: 'Name',
                type: sql.NVarChar(50),
                value: connection.connectionName,
            },
            {
                field: 'List',
                type: sql.NVarChar(100),
                value: connection.connectionList,
            },
        ];
        return params;
    }
    static toIdParam(id) {
        return [
            {
                field: 'Id',
                type: sql.NVarChar(20),
                value: id,
            },
        ];
    }
}
exports.ConnectionDataMapper = ConnectionDataMapper;
//# sourceMappingURL=connection.mapper.js.map