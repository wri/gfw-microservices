import { ConnectionRepository } from 'src/Connection/domain/connection.repository';
import { Connection } from 'src/Connection/domain/connection';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import { ConnectionDataMapper } from 'src/Connection/application/connection.mapper';

export class ConnectionRepositoryMysql
  extends RepositoryMysql
  implements ConnectionRepository
{
  async persistConnection(connection: Connection): Promise<void> {
    const params = ConnectionDataMapper.toProcedureParam(connection);
    const saveConnection = this.storeProcedureFactory.create(
      'saveConnection',
      params,
    );
    await saveConnection.execute();
  }

  async acceptConnection(id: string): Promise<void> {
    const params = ConnectionDataMapper.toIdParam(id);
    const acceptConnection = this.storeProcedureFactory.create(
      'acceptConnection',
      params,
    );
    await acceptConnection.execute();
  }

  async deleteConnection(id: string): Promise<void> {
    const params = ConnectionDataMapper.toIdParam(id);
    const acceptConnection = this.storeProcedureFactory.create(
      'deleteConnection',
      params,
    );
    await acceptConnection.execute();
  }
}
