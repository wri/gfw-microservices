import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { SearchResult } from '../../Shared/domain/types';
import { MultiConnectRepository } from '../../Shared/infraestructure/typeorm/multi-connect.repository';
import { ConnectionRequest } from '../domain/connection.entity';
import { ConnectionRequestRepository } from '../domain/connection.repository';

@Injectable()
export class ConnectionRequestRepositoryMssql
  extends MultiConnectRepository<ConnectionRequest>
  implements ConnectionRequestRepository
{
  constructor(
    @InjectRepository(ConnectionRequest)
    repository: Repository<ConnectionRequest>,
  ) {
    super(repository);
  }
  async search(
    query: QueryCriteria,
    organizationId: string,
  ): ResultPromise<SearchResult<ConnectionRequest>> {
    query.filters.filters = query.filters.filters.filter(
      (filter) =>
        filter.field.value !== 'idTargetOrganization' &&
        filter.field.value !== 'idSourceOrganization',
    );
    const qb = this.repository
      .createQueryBuilder()
      .where(
        'id_source_organization = :orgId OR id_target_organization = :orgId',
        { orgId: organizationId },
      );

    const result = await this.searchByCriteriaQuery(query, this.repository, qb);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }

  async getConnectionRequestID(orgId1, orgId2) {
    const result = await this.repository
      .createQueryBuilder()
      .where(
        'id_source_organization = :orgId1 AND id_target_organization = :orgId2',
        { orgId1, orgId2 },
      )
      .orWhere(
        'id_source_organization = :orgId2 AND id_target_organization = :orgId1',
        { orgId1, orgId2 },
      )
      .getOne();

    return Result.ok(result);
  }
}
