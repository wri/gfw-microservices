import ResultPromise from '../../Shared/domain/result/result.promise';
import { SharedListEntity } from '../infrastructure/list-shared.entity';

export abstract class ListRepository {
  abstract create(list: SharedListEntity): ResultPromise<SharedListEntity>;
  abstract update(
    id: number,
    list: SharedListEntity,
  ): ResultPromise<SharedListEntity>;
  abstract delete(id: number): ResultPromise<void>;
}
