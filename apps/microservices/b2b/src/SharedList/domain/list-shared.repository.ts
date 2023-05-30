import { ListShared } from './list-shared.entity';

export interface ListSharedRepository {
  create(entity: ListShared): Promise<ListShared>;
  update(id: number, entity: ListShared): Promise<ListShared | undefined>;
  delete(id: number): Promise<void>;
}
