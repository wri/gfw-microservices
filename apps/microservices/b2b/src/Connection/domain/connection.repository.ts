import ResultPromise from '../../Shared/domain/result/result.promise';
import {
  ConnectionAdminOrganizationDbDto,
  ConnectionAdminOrganizationDto,
} from '../application/dtos/connection-admin-organizations.dto';
import { ConnectionDbDto } from '../application/dtos/connection-db.dto';
import { ConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { ConnectionChangeDto } from '../application/dtos/connection-status.dto';
import { Connection } from './connection';

export abstract class ConnectionRepository {
  abstract acceptConnection(
    changeStatusDto: ConnectionChangeDto,
  ): ResultPromise<Number>;
  abstract getUserAdminOrganization(
    email: string,
  ): ResultPromise<ConnectionAdminOrganizationDto[]>;
  abstract getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<Connection[]>;
}
