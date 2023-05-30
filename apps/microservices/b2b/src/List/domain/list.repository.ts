import { Repository } from 'typeorm';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { List } from './list.entity';

export abstract class ListRepository {
  constructor(public readonly repository: Repository<List>) {}
  abstract findListsByFilters(filters: any): ResultPromise<List[]>;
  abstract findListById(id: number): ResultPromise<List | undefined>;
}
