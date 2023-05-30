import { ConnectionRepository } from '../../../Connection/domain/connection.repository';
import { ListRepository } from '../../../List/domain/list.repository';
import { DataServices } from '../../domain/data-service';

export class DataServicesService implements DataServices {
  constructor(
    public connection: ConnectionRepository,
    public list: ListRepository,
  ) {}
}
