import { ConnectionRepository } from '../../Connection/domain/connection.repository';
import { ListRepository } from '../../List/domain/list.repository';

export abstract class DataServices {
  abstract connection: ConnectionRepository;
  abstract list: ListRepository;
}
