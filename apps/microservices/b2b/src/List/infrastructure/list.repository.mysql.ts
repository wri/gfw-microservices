import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { MultiConnectRepository } from '../../Shared/infraestructure/typeorm/multi-connect.repository';
import { List } from '../domain/list.entity';
import { ListRepository } from '../domain/list.repository';

@Injectable()
export class ListRepositoryMysql
  extends MultiConnectRepository<List>
  implements ListRepository
{
  constructor(
    @InjectRepository(List)
    repository: Repository<List>,
  ) {
    super(repository);
  }

  async findListsByFilters(
    filters: { [key in string]: string | boolean },
    db: string,
  ): ResultPromise<List[]> {
    const repoPromise = await this.dbRepositorySelector(db);
    const repo = repoPromise.isSuccess ? repoPromise.getValue() : null;
    if (repo) {
      const query = repo.createQueryBuilder('list').where(filters);
      query.orderBy('list.listName', 'ASC');
      const lists = await query.getMany();
      return Result.ok(lists);
    }
    return Result.fail(new ResultError('List Repository not found', 500));
  }

  async findListById(id: number, db: string): ResultPromise<List | undefined> {
    const repoPromise = await this.dbRepositorySelector(db);
    const repo = repoPromise.isSuccess ? repoPromise.getValue() : null;
    if (repo) {
      const list = await repo.findOneBy({ id });
      return Result.ok(list);
    }
    return Result.fail(new ResultError('List Repository not found', 500));
  }
}
