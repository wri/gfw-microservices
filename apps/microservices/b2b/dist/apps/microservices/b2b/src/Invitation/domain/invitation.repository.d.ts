import { Invitation } from 'src/Invitation/domain/invitation';
export interface InvitationRepository {
    resendInvitation(id: string): Promise<void>;
    createInvitation(invitation: Invitation): Promise<void>;
}
