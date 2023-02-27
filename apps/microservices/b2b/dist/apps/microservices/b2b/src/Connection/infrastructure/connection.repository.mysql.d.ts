import { ConnectionRepository } from 'src/Connection/domain/connection.repository';
import { Connection } from 'src/Connection/domain/connection';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
export declare class ConnectionRepositoryMysql extends RepositoryMysql implements ConnectionRepository {
    persistConnection(connection: Connection): Promise<void>;
    acceptConnection(id: string): Promise<void>;
    deleteConnection(id: string): Promise<void>;
}
