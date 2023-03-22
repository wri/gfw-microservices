import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionDbDto } from '../application/dtos/connection-db.dto';
import { ConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { ConnectionChangeDto } from '../application/dtos/connection-status.dto';
import { Connection } from './connection';

export abstract class ConnectionRepository {
  abstract persistConnection(connection: Connection): Promise<void>;
  abstract acceptConnection(
    changeStatusDto: ConnectionChangeDto,
  ): ResultPromise<Number>;
  abstract deleteConnection(id: string): Promise<void>;
  abstract getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<Connection[]>;
}
