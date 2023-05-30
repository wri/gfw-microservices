import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, Repository } from 'typeorm';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { List } from '../domain/list.entity';
import { ListRepository } from '../domain/list.repository';

@Injectable()
export class ListRepositoryMysql implements ListRepository {
  constructor(
    @InjectRepository(List)
    public readonly repository: Repository<List>,
  ) {}

  async findListsByFilters(filters: any): ResultPromise<List[]> {
    const query = this.repository.createQueryBuilder('list').where(filters);
    query.orderBy('list.listName', 'ASC');
    const lists = await query.getMany();
    return Result.ok(lists);
  }

  async findListById(id: number): ResultPromise<List | undefined> {
    const list = await this.repository.findOneBy({ id });
    return Result.ok(list);
  }
}
