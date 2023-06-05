import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Operator,
} from '../../Shared/domain/criteria/filter.operator';
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
    query.filters.addFilter({
      field: 'idTargetOrganization',
      operator: Operator.EQUAL,
      value: organizationId,
    });

    const result = await this.searchByCriteria(query);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }
}
