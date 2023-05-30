import { List } from 'apps/microservices/b2b/src/List/domain/list.entity';
import { ListShared } from 'apps/microservices/b2b/src/SharedList/domain/list-shared.entity';
import { ConnectionRequest } from '../../../../Connection/domain/connection.entity';

export default [List, ConnectionRequest, ListShared];
