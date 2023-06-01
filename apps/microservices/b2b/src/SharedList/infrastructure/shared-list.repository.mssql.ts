import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
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
