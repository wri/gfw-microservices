import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListShared } from '../domain/list-shared.entity';
import { ListSharedRepository } from '../domain/list-shared.repository';

@Injectable()
export class ListSharedRepositoryMySql
  implements ListSharedRepository
{
  constructor(
    @InjectRepository(ListShared)
    private readonly ListSharedRepository: Repository<ListShared>,
  ) {}

  async create(entity: ListShared): Promise<ListShared> {
    const createdEntity = await this.ListSharedRepository.save(entity);
    return createdEntity;
  }

  async update(
    id: number,
    entity: ListShared,
  ): Promise<ListShared | undefined> {
    await this.ListSharedRepository.update(id, entity);
    const updatedEntity = await this.ListSharedRepository.findOneBy({ id });
    return updatedEntity;
  }

  async delete(id: number): Promise<void> {
    await this.ListSharedRepository.delete(id);
  }
}
