import { Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { ConnectionDataMapper } from './connection.mapper';

@Injectable()
export class ConnectionUseCases {
  constructor(private dataServices: DataServices) {}

  async createConnection(connectionDto: CreateConnectionDto): Promise<void> {
    const connection =
      ConnectionDataMapper.createConnectionDtotoConnection(connectionDto);
    return this.dataServices.connection.persistConnection(connection);
  }

  async acceptConnection(id: any): Promise<void> {
    return this.dataServices.connection.acceptConnection(id);
  }

  async deleteConnection(id: any): Promise<void> {
    return this.dataServices.connection.deleteConnection(id);
  }
}
