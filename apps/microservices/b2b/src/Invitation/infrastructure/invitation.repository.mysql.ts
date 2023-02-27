import { InvitationRepository } from 'src/Invitation/domain/invitation.repository';
import { Invitation } from 'src/Invitation/domain/invitation';
import { InvitationDataMapper } from 'src/Invitation/application/invitation.mapper';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';

export class InvitationRepositoryMysql
  extends RepositoryMysql
  implements InvitationRepository
{
  async resendInvitation(id: string): Promise<void> {
    const params = InvitationDataMapper.toIdParam(id);
    const resendInvitation = this.storeProcedureFactory.create(
      'resendInvitation',
      params,
    );
    await resendInvitation.execute();
  }

  async createInvitation(invitation: Invitation): Promise<void> {
    const params = InvitationDataMapper.toProcedureParam(invitation);
    const createInvitation = this.storeProcedureFactory.create(
      'createInvitation',
      params,
    );
    await createInvitation.execute();
  }
}
