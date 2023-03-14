import { Module } from '@nestjs/common';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { ConnectionRepository } from './domain/connection.repository';
import { ConnectionRepositoryMysql } from './infrastructure/connection.repository.mysql';
import { ConnectionDataMapper } from './application/connection.mapper';
import { ConnectionUseCases } from './application/connection.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [
    ConnectionDataMapper,
    ConnectionUseCases,
    { provide: ConnectionRepository, useClass: ConnectionRepositoryMysql },
  ],
  exports: [ConnectionDataMapper, ConnectionUseCases],
})
export class ConnectionUseCasesModule {}
