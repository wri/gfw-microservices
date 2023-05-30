import { Inject, Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../Database/database.provider';
import ResultPromise from '../../Shared/domain/result/result.promise';
import {  } from '../../SharedList/domain/list-shared.repository';
import { List } from '../domain/list.entity';
import { ListRepository } from '../domain/list.repository';

@Injectable()
export class ListUseCases {

  @Inject(DatabaseProvider)
  private readonly databaseProvider: DatabaseProvider;

  constructor(private readonly listRepository: ListRepository) {}

  async findListsByFilters(filters: any): ResultPromise<List[]> {
    await this.databaseProvider.getConnection('clientstore-DevCo')
    //console.log(this.databaseProvider.getConnections())
    const lists = await this.listRepository.findListsByFilters(filters);
    return lists;
  }

  async findListById(id: number): ResultPromise<List | undefined> {
    const list = await this.listRepository.findListById(id);
    return list;
  }
}
