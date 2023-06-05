import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { DatabaseProvider } from '../../../Database/database.provider';
import { ERRORS } from '../../domain/constants';
import { QueryCriteria } from '../../domain/criteria/query';
import Result from '../../domain/result';
import ResultPromise from '../../domain/result/result.promise';
import { SearchResult } from '../../domain/types';
import { MapperQueryTypeORM } from './query.mapper';

@Injectable()
export abstract class MultiConnectRepository<T> {
  protected readonly repository: Repository<T>;

  @Inject(DatabaseProvider)
  private readonly databaseProvider: DatabaseProvider;

  @Inject(MapperQueryTypeORM)
  private readonly convertQuery: MapperQueryTypeORM;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  protected async dbRepositorySelector(
    databaseName: string,
  ): ResultPromise<Repository<T>> {
    const connect = await this.databaseProvider.getConnection(databaseName);
    if (connect.isSuccess) {
      return Result.ok(
        connect.getValue().getRepository(this.repository.target),
      );
    }
    return Result.fail(connect.getError());
  }

  protected async searchByCriteria(
    query: QueryCriteria,
    options?: { findOptions?: FindManyOptions<T>; repository?: Repository<T> },
  ): ResultPromise<SearchResult<T>> {
    const repository = (options && options.repository) || this.repository;
    const findOptions = (options && options.findOptions) || {};

    const typeormQuery = this.convertQuery.convert(query);

    const sequelizeQuery: FindManyOptions = {
      ...typeormQuery,
      ...findOptions,
    };
    const { limit, offset } = query;
    console.log(sequelizeQuery);

    const promises = await Promise.allSettled([
      repository.find(sequelizeQuery),
      repository.count(sequelizeQuery),
    ]);

    const verifyPromise = (promise) =>
      promise.status === 'fulfilled' ? promise.value : null;

    const items = verifyPromise(promises[0]);
    const count = verifyPromise(promises[1]);
    if (items && count != null)
      return Result.ok({ count, offset, limit, items });
    return Result.fail(ERRORS.NOT_ELEMENTS_FOUND);
  }

  public async getConnection(databaseName: string): Promise<Repository<T>> {
    const connection = await this.databaseProvider.getConnection(databaseName);
    return connection.getValue().getRepository(this.repository.target);
  }
}
