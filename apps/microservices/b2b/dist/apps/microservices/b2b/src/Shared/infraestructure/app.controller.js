"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const app_service_1 = require("../application/services/app.service");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
};
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map