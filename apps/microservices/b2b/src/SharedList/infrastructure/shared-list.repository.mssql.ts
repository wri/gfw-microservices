import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionRequest } from '../../Connection/domain/connection.entity';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { SearchResult } from '../../Shared/domain/types';
import { MultiConnectRepository } from '../../Shared/infraestructure/typeorm/multi-connect.repository';
import { SharedList } from '../domain/shared-list.entity';
import { SharedListRepository } from '../domain/shared-list.repository';

@Injectable()
export class SharedListRepositoryMssql
  extends MultiConnectRepository<SharedList>
  implements SharedListRepository
{
  constructor(
    @InjectRepository(SharedList)
    repository: Repository<SharedList>,
  ) {
    super(repository);
  }

  update(id: number, entity: SharedList): ResultPromise<SharedList> {
    throw new Error('Method not implemented.');
  }
  delete(id: number): ResultPromise<void> {
    throw new Error('Method not implemented.');
  }

  async create(entity: SharedList): ResultPromise<SharedList> {
    const createdEntity = await this.repository.save(entity);
    return Result.ok(createdEntity);
  }

  async search(query: QueryCriteria): ResultPromise<SearchResult<SharedList>> {
    const result = await this.searchByCriteriaFind(query);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }

  /*
  async update(
    id: number,
    entity: SharedList,
  ): ResultPromise<SharedList | undefined> {
    await this.ListSharedRepository.update(id, entity);
    const updatedEntity = await this.ListSharedRepository.findOneBy({ id });
    return updatedEntity;
  }

  async delete(id: number): ResultPromise<void> {
    await this.ListSharedRepository.delete(id);
  }
  */
}
