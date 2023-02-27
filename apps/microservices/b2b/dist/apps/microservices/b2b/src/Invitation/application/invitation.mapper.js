"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationDataMapper = void 0;
const class_transformer_1 = require("class-transformer");
const sql = require("mssql");
const invitation_1 = require("../domain/invitation");
class InvitationDataMapper {
    static createInvitationDtotoInvitation(invitationDto) {
        return (0, class_transformer_1.plainToInstance)(invitation_1.Invitation, invitationDto);
    }
    static toProcedureParam(invitation) {
        const params = [
            {
                field: 'Addressees',
                type: sql.NVarChar(50),
                value: invitation.addressees,
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
exports.InvitationDataMapper = InvitationDataMapper;
//# sourceMappingURL=invitation.mapper.js.map