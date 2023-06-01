import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { MultiConnectRepository } from '../../Shared/infraestructure/typeorm/multi-connect.repository';
import { List } from './list.entity';

export abstract class ListRepository {
  abstract findListsByFilters(filters: any, db: string): ResultPromise<List[]>;
  abstract findListById(id: number): ResultPromise<List | undefined>;
}
