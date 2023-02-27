"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const invitation_dto_1 = require("../application/dtos/invitation.dto");
const invitation_use_case_1 = require("../application/invitation.use-case");
let InvitationController = class InvitationController {
    constructor(invitationUseCases) {
        this.invitationUseCases = invitationUseCases;
    }
    createInvitation(invitationDto) {
        return this.invitationUseCases.createInvitation(invitationDto);
    }
    resendInvitation(invitationId) {
        return this.invitationUseCases.resendInvitation(invitationId);
    }
};
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [invitation_dto_1.CreateInvitationDto]),
    tslib_1.__metadata("design:returntype", void 0)
], InvitationController.prototype, "createInvitation", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], InvitationController.prototype, "resendInvitation", null);
InvitationController = tslib_1.__decorate([
    (0, common_1.Controller)('api/invitation'),
    tslib_1.__metadata("design:paramtypes", [invitation_use_case_1.InvitationUseCases])
], InvitationController);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map