import { Connection } from './connection';

export abstract class ConnectionRepository {
  abstract persistConnection(connection: Connection): Promise<void>;
  abstract acceptConnection(id: string): Promise<void>;
  abstract deleteConnection(id: string): Promise<void>;
}
