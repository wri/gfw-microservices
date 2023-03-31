import ResultPromise from '../../Shared/domain/result/result.promise';
import { Invitation } from '../domain/invitation';

export abstract class InvitationRepository {
  abstract resendInvitation(id: string): ResultPromise<void>;
  abstract createInvitation(invitation: Invitation): ResultPromise<Number>;
}
