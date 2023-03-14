import { InvitationRepository } from '../domain/invitation.repository';
import { Invitation } from '../domain/invitation';
import { InvitationDataMapper } from '../application/invitation.mapper';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import { Injectable } from '@nestjs/common';

export class InvitationRepositoryMysql
  extends RepositoryMysql
  implements InvitationRepository
{
  private mapper: InvitationDataMapper;
  constructor() {
    super();
    this.mapper = new InvitationDataMapper();
  }

  async resendInvitation(id: string): Promise<void> {
    const params = this.mapper.toIdParam(id);
    const resendInvitation = this.storeProcedureFactory.create(
      'resendInvitation',
      params,
    );
    await resendInvitation.execute();
  }

  async createInvitation(invitation: Invitation): Promise<Number> {
    const params = this.mapper.toProcedureParam(invitation);
    const createInvitation = this.storeProcedureFactory.create(
      'uspCreateConnectionRequest',
      params,
    );
    return await createInvitation.execute<Number>();
  }
}

//uspGetConnectionRequest

/* 
DECLARE @id INT;
EXEC uspCreateConnectionRequest @source_email = "gustavo.figueiredo.5@wriconsultant.org", @target_email = "icollins@wri.org", @source_organization = 1, @target_organization = 4, @id_connection = @id OUTPUT;
SELECT @id;

DECLARE @id INT;
EXEC uspCreateConnectionRequest @source_email = "isma.martinez.5@wriconsultant.org", @target_email = "abilwani@blueraster.com", @source_organization = 1, @target_organization = 2, @status="accepted", @id_connection = @id OUTPUT;
SELECT @id;
*/
