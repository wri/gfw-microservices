"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRepositoryMysql = void 0;
const repository_mysql_1 = require("../../Shared/infraestructure/mysql/repository.mysql");
const connection_mapper_1 = require("../application/connection.mapper");
class ConnectionRepositoryMysql extends repository_mysql_1.RepositoryMysql {
    async persistConnection(connection) {
        const params = connection_mapper_1.ConnectionDataMapper.toProcedureParam(connection);
        const saveConnection = this.storeProcedureFactory.create('saveConnection', params);
        await saveConnection.execute();
    }
    async acceptConnection(id) {
        const params = connection_mapper_1.ConnectionDataMapper.toIdParam(id);
        const acceptConnection = this.storeProcedureFactory.create('acceptConnection', params);
        await acceptConnection.execute();
    }
    async deleteConnection(id) {
        const params = connection_mapper_1.ConnectionDataMapper.toIdParam(id);
        const acceptConnection = this.storeProcedureFactory.create('deleteConnection', params);
        await acceptConnection.execute();
    }
}
exports.ConnectionRepositoryMysql = ConnectionRepositoryMysql;
//# sourceMappingURL=connection.repository.mysql.js.map