"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionUseCases = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_service_1 = require("../../Shared/domain/data-service");
const connection_mapper_1 = require("./connection.mapper");
let ConnectionUseCases = class ConnectionUseCases {
    constructor(dataServices) {
        this.dataServices = dataServices;
    }
    async createConnection(connectionDto) {
        const connection = connection_mapper_1.ConnectionDataMapper.createConnectionDtotoConnection(connectionDto);
        return this.dataServices.connection.persistConnection(connection);
    }
    async acceptConnection(id) {
        return this.dataServices.connection.acceptConnection(id);
    }
    async deleteConnection(id) {
        return this.dataServices.connection.deleteConnection(id);
    }
};
ConnectionUseCases = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_service_1.DataServices])
], ConnectionUseCases);
exports.ConnectionUseCases = ConnectionUseCases;
//# sourceMappingURL=connection.use-case.js.map