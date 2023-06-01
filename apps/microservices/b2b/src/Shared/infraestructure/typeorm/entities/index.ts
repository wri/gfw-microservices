import { List } from 'apps/microservices/b2b/src/List/domain/list.entity';
import { Organization } from 'apps/microservices/b2b/src/Organization/domain/organization.entity';
import { SharedList } from 'apps/microservices/b2b/src/SharedList/domain/shared-list.entity';
import { ConnectionRequest } from '../../../../Connection/domain/connection.entity';

export default [List, ConnectionRequest, SharedList, Organization];
