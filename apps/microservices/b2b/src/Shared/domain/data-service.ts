import { ConnectionRepositorySP } from '../../Connection/domain/connection.repository.sp';
import { ListRepository } from '../../List/domain/list.repository';

export abstract class DataServices {
  abstract connection: ConnectionRepositorySP;
  abstract list: ListRepository;
}
