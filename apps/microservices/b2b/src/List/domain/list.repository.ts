import ResultPromise from '../../Shared/domain/result/result.promise';
import { List } from './list.entity';

export abstract class ListRepository {
  abstract findListsByFilters(
    filters: { [key in string]: string | boolean },
    db: string,
  ): ResultPromise<List[]>;
  abstract findListById(
    id: number,
    db: string,
  ): ResultPromise<List | undefined>;
}
