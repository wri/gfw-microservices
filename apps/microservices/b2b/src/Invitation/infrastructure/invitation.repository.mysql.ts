import { InvitationRepository } from '../domain/invitation.repository';
import { Invitation } from '../domain/invitation';
import { InvitationDataMapper } from '../application/invitation.mapper';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import { Injectable } from '@nestjs/common';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';

export class InvitationRepositoryMysql
  extends RepositoryMysql
  implements InvitationRepository
{
  private mapper: InvitationDataMapper;

  constructor(private mapper2: InvitationDataMapper) {
    super();
    this.mapper = new InvitationDataMapper();
  }

  async resendInvitation(id: string): ResultPromise<void> {
    const params = this.mapper.toIdParam(id);
    const resendInvitation = this.storeProcedureFactory.create(
      'resendInvitation',
      params,
    );
    return await resendInvitation.execute();
  }

  async createInvitation(invitation: Invitation): ResultPromise<Number> {
    const params = this.mapper.toProcedureParam(invitation);
    const createInvitation = this.storeProcedureFactory.create(
      'uspCreateConnectionRequest',
      params,
    );
    let result = await createInvitation.execute<Number>();
    return result;
  }
}