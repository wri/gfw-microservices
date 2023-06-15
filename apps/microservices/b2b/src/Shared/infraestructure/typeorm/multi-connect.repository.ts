import { Inject, Injectable } from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { DatabaseProvider } from '../../../Database/database.provider';
import { ERRORS } from '../../domain/constants';
import { QueryCriteria } from '../../domain/criteria/query';
import Result from '../../domain/result';
import ResultPromise from '../../domain/result/result.promise';
import { SearchResult } from '../../domain/types';
import { MapperFindTypeORM } from './find.mapper';
import { MapperQueryTypeORM } from './query-builder.mapper';

@Injectable()
export abstract class MultiConnectRepository<T> {
  protected readonly repository: Repository<T>;

  @Inject(DatabaseProvider)
  private readonly databaseProvider: DatabaseProvider;

  @Inject(MapperFindTypeORM)
  private readonly convertFind: MapperFindTypeORM;

  @Inject(MapperQueryTypeORM)
  private readonly convertQuery: MapperQueryTypeORM<T>;

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

  protected async searchByCriteriaQuery(
    query: QueryCriteria,
    repository?: Repository<T>,
    qb?: SelectQueryBuilder<T>,
  ): ResultPromise<SearchResult<T>> {
    repository = repository || this.repository;
    qb = qb || repository.createQueryBuilder();

    this._mapFieldsToQuery(repository, query);
    this.convertQuery.convert(query, qb);

    console.log(qb.getQuery());

    const { limit, offset } = query;
    const [items, count] = await qb.getManyAndCount();

    if (items && count != null)
      return Result.ok({ count, offset, limit, items });
    return Result.fail(ERRORS.NOT_ELEMENTS_FOUND);
  }

  protected async searchByCriteriaFind(
    query: QueryCriteria,
    options?: { findOptions?: FindManyOptions<T>; repository?: Repository<T> },
  ): ResultPromise<SearchResult<T>> {
    const repository = (options && options.repository) || this.repository;
    const findOptions = (options && options.findOptions) || {};

    const typeormQuery = this.convertFind.convert(query);

    const sequelizeQuery: FindManyOptions = {
      ...typeormQuery,
      ...findOptions,
    };

    const { limit, offset } = query;
    const [items, count] = await repository.findAndCount(sequelizeQuery);

    if (items && count != null)
      return Result.ok({ count, offset, limit, items });
    return Result.fail(ERRORS.NOT_ELEMENTS_FOUND);
  }

  private _mapFieldsToQuery(repository: Repository<T>, query) {
    const metadata = repository.manager.connection.getMetadata(
      this.repository.target,
    );
    const columns = metadata.columns.reduce((acc, column) => {
      acc[column.propertyName] = column.databaseNameWithoutPrefixes;
      return acc;
    }, {});

    query.filters.filters.forEach((filter) => {
      filter.field.value = columns[filter.field.value];
    });

    query.orders.orders.forEach((filter) => {
      filter.orderBy.value = columns[filter.orderBy.value];
    });
  }

  public async getConnection(databaseName: string): Promise<Repository<T>> {
    const connection = await this.databaseProvider.getConnection(databaseName);
    return connection.getValue().getRepository(this.repository.target);
  }

  public async getConnectionWithoutRepo(
    databaseName: string,
  ): Promise<DataSource> {
    const connection = await this.databaseProvider.getConnection(databaseName);
    return connection.getValue();
  }
}
