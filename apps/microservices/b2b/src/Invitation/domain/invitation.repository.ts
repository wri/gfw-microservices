import { Invitation } from '../domain/invitation';

export abstract class InvitationRepository {
  abstract resendInvitation(id: string): Promise<void>;
  abstract createInvitation(invitation: Invitation): Promise<Number>;
}
