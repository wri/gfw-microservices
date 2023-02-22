import { Connection } from '../../entities/connection';

export interface ConnectionRepository {
  persistConnection(connection: Connection): Promise<void>;
  acceptConnection(id: string): Promise<void>;
  deleteConnection(id: string): Promise<void>;
}
