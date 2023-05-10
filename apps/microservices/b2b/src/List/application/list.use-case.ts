import { Injectable } from '@nestjs/common';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { SharedListEntity } from '../infrastructure/list-shared.entity';
import { ListRepository } from './connection.repository';

@Injectable()
export class ListService {
  constructor(private readonly listRepository: ListRepository) {}

  async create(list: SharedListEntity): ResultPromise<SharedListEntity> {
    return this.listRepository.create(list);
  }

  async update(
    id: number,
    list: SharedListEntity,
  ): ResultPromise<SharedListEntity> {
    return this.listRepository.update(id, list);
  }

  async delete(id: number): ResultPromise<void> {
    return this.listRepository.delete(id);
  }
}
