"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const connection_dto_1 = require("../application/dtos/connection.dto");
const connection_use_case_1 = require("../application/connection.use-case");
let ConnectionController = class ConnectionController {
    constructor(connectionUseCases) {
        this.connectionUseCases = connectionUseCases;
    }
    async acceptConnection(id) {
        return this.connectionUseCases.acceptConnection(id);
    }
    createConnection(connectionDto) {
        return this.connectionUseCases.createConnection(connectionDto);
    }
    deleteConnection(connectionId) {
        return this.connectionUseCases.deleteConnection(connectionId);
    }
};
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ConnectionController.prototype, "acceptConnection", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [connection_dto_1.CreateConnectionDto]),
    tslib_1.__metadata("design:returntype", void 0)
], ConnectionController.prototype, "createConnection", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], ConnectionController.prototype, "deleteConnection", null);
ConnectionController = tslib_1.__decorate([
    (0, common_1.Controller)('api/connection'),
    tslib_1.__metadata("design:paramtypes", [connection_use_case_1.ConnectionUseCases])
], ConnectionController);
exports.ConnectionController = ConnectionController;
//# sourceMappingURL=connection.controller.js.map