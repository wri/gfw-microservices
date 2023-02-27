"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationUseCases = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_service_1 = require("../../Shared/domain/data-service");
const invitation_mapper_1 = require("./invitation.mapper");
let InvitationUseCases = class InvitationUseCases {
    constructor(dataServices) {
        this.invitationRepo = dataServices.invitation;
    }
    createInvitation(invitationDto) {
        const invitation = invitation_mapper_1.InvitationDataMapper.createInvitationDtotoInvitation(invitationDto);
        return this.invitationRepo.createInvitation(invitation);
    }
    resendInvitation(id) {
        return this.invitationRepo.resendInvitation(id);
    }
};
InvitationUseCases = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_service_1.DataServices])
], InvitationUseCases);
exports.InvitationUseCases = InvitationUseCases;
//# sourceMappingURL=invitation.use-case.js.map