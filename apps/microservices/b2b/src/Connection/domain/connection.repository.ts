import { QueryCriteria } from '../../Shared/domain/criteria/query';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { SearchResult } from '../../Shared/domain/types';
import { ConnectionRequest } from './connection.entity';

export abstract class ConnectionRequestRepository {
  abstract search(
    query: QueryCriteria,
    organizationId: string
  ): ResultPromise<SearchResult<ConnectionRequest> | undefined>;
}
