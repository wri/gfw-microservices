import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, FindOperator, Repository } from 'typeorm';
import { DatabaseProvider } from '../../Database/database.provider';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import { ERRORS } from '../../Shared/domain/constants';
import { Filter } from '../../Shared/domain/criteria/filter';
import { FilterField } from '../../Shared/domain/criteria/filter.field';
import {
  FilterOperator,
  Operator,
} from '../../Shared/domain/criteria/filter.operator';
import { FilterValue } from '../../Shared/domain/criteria/filter.value';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
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
    query.filters.filters.filter(
      (filter) =>
        filter.field.value !== 'idTargetOrganization' &&
        filter.field.value !== 'idSourceOrganization',
    );

/*
    query.filters.addFilter(
      new Filter(
        new FilterField('idSourceOrganization'),
        new FilterOperator(Operator.EQUAL),
        new FilterValue(organizationId),
      ),
    );

    query.filters.addFilter(
      new Filter(
        new FilterField('idTargetOrganization'),
        new FilterOperator(Operator.EQUAL),
        new FilterValue(organizationId),
      ),
    );
*/
    console.log(query.filters)

    const result = await this.searchByCriteria(query);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }
}
