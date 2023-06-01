import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DatabaseProvider } from '../../../Database/database.provider';
import Result from '../../domain/result';
import ResultPromise from '../../domain/result/result.promise';

@Injectable()
export abstract class MultiConnectRepository<T> {
  protected readonly repository: Repository<T>;

  @Inject(DatabaseProvider)
  private readonly databaseProvider: DatabaseProvider;

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

  public async getConnection(databaseName: string): Promise<Repository<T>> {
    const connection = await this.databaseProvider.getConnection(databaseName);
    return connection.getValue().getRepository(this.repository.target);
  }
}
