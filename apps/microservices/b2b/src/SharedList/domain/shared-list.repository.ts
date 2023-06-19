import { QueryCriteria } from '../../Shared/domain/criteria/query';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { SearchResult } from '../../Shared/domain/types';
import { SharedList } from './shared-list.entity';

export abstract class SharedListRepository {
  abstract create(entity: SharedList): ResultPromise<SharedList>;
  abstract update(
    id: number,
    entity: SharedList,
  ): ResultPromise<SharedList | undefined>;
  abstract delete(id: number): ResultPromise<void>;
  abstract search(
    query: QueryCriteria,
  ): ResultPromise<SearchResult<SharedList> | undefined>;
}
