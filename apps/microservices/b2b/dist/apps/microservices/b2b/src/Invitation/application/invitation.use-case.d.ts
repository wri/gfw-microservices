import { DataServices } from 'src/Shared/domain/data-service';
import { CreateInvitationDto } from 'src/Invitation/application/dtos/invitation.dto';
export declare class InvitationUseCases {
    private invitationRepo;
    constructor(dataServices: DataServices);
    createInvitation(invitationDto: CreateInvitationDto): Promise<void>;
    resendInvitation(id: any): Promise<void>;
}
