import { Invitation } from 'src/core/entities/invitation';

export interface InvitationRepository {
  resendInvitation(id: string): Promise<void>;
  createInvitation(invitation: Invitation): Promise<void>;
}
