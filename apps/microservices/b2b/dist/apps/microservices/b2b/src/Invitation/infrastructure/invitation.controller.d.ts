import { CreateInvitationDto } from 'src/Invitation/application/dtos/invitation.dto';
import { InvitationUseCases } from 'src/Invitation/application/invitation.use-case';
export declare class InvitationController {
    private invitationUseCases;
    constructor(invitationUseCases: InvitationUseCases);
    createInvitation(invitationDto: CreateInvitationDto): Promise<void>;
    resendInvitation(invitationId: string): Promise<void>;
}
