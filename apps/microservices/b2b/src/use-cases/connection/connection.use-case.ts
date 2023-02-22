import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from 'src/core/dtos/connection.dto';
import { Connection } from 'src/core/entities/connection';

@Injectable()
export class ConnectionUseCases {
  constructor(private dataServices: IDataServices) {}

  createConnection(connectionDto: CreateConnectionDto): Promise<Connection[]> {
    return this.dataServices.connection.create();
  }

  acceptConnection(id: any): Promise<Connection> {
    return this.dataServices.connection.accept(id);
  }

  deleteConnection(id: any): Promise<Connection> {
    return this.dataServices.connection.delete(id);
  }
}
