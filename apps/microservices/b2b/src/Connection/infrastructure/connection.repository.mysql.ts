import { ConnectionRepository } from '../domain/connection.repository';
import { Connection } from '../domain/connection';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import { ConnectionDataMapper } from '../application/connection.mapper';

export class ConnectionRepositoryMysql
  extends RepositoryMysql
  implements ConnectionRepository
{
  async persistConnection(connection: Connection): Promise<void> {
    const params = ConnectionDataMapper.toProcedureParam(connection);
    const saveConnection = this.storeProcedureFactory.create(
      'uspCreateConnectionRequest',
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
//uspGetConnectionRequest


/* 
DECLARE @id INT;
EXEC uspCreateConnectionRequest @source_email = "gustavo.figueiredo.5@wriconsultant.org", @target_email = "icollins@wri.org", @source_organization = 1, @target_organization = 4, @id_connection = @id OUTPUT;
SELECT @id;

DECLARE @id INT;
EXEC uspCreateConnectionRequest @source_email = "isma.martinez.5@wriconsultant.org", @target_email = "abilwani@blueraster.com", @source_organization = 1, @target_organization = 2, @status="accepted", @id_connection = @id OUTPUT;
SELECT @id;
*/