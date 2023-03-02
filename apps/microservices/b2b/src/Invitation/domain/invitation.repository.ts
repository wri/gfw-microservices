import { Invitation } from '../domain/invitation';

export interface InvitationRepository {
  resendInvitation(id: string): Promise<void>;
  createInvitation(invitation: Invitation): Promise<void>;
}
