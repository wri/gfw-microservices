import { ConnectionRepositorySP } from '../../../Connection/domain/connection.repository.sp';
import { ListRepository } from '../../../List/domain/list.repository';
import { DataServices } from '../../domain/data-service';

export class DataServicesService implements DataServices {
  constructor(
    public connection: ConnectionRepositorySP,
    public list: ListRepository,
  ) {}
}
