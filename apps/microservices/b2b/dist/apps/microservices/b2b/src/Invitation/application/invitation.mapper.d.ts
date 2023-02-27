import { CreateInvitationDto } from 'src/Invitation/application/dtos/invitation.dto';
import { Invitation } from 'src/Invitation/domain/invitation';
import { ParamStoreProcedure } from 'src/Shared/infraestructure/mysql/store-procedure.params';
export declare class InvitationDataMapper {
    static createInvitationDtotoInvitation(invitationDto: CreateInvitationDto): Invitation;
    static toProcedureParam(invitation: Invitation): ParamStoreProcedure[];
    static toIdParam(id: string): ParamStoreProcedure[];
}
