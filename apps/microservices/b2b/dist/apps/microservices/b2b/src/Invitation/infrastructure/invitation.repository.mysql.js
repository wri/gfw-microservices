"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRepositoryMysql = void 0;
const invitation_mapper_1 = require("../application/invitation.mapper");
const repository_mysql_1 = require("../../Shared/infraestructure/mysql/repository.mysql");
class InvitationRepositoryMysql extends repository_mysql_1.RepositoryMysql {
    async resendInvitation(id) {
        const params = invitation_mapper_1.InvitationDataMapper.toIdParam(id);
        const resendInvitation = this.storeProcedureFactory.create('resendInvitation', params);
        await resendInvitation.execute();
    }
    async createInvitation(invitation) {
        const params = invitation_mapper_1.InvitationDataMapper.toProcedureParam(invitation);
        const createInvitation = this.storeProcedureFactory.create('createInvitation', params);
        await createInvitation.execute();
    }
}
exports.InvitationRepositoryMysql = InvitationRepositoryMysql;
//# sourceMappingURL=invitation.repository.mysql.js.map