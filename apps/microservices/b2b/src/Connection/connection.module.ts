import { Module } from '@nestjs/common';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { ConnectionRepository } from './domain/connection.repository';
import { ConnectionRepositoryMysql } from './infrastructure/connection.repository.mysql';
import { ConnectionDataMapper } from './application/connection.mapper';
import { ConnectionUseCases } from './application/connection.use-case';
import { LogsModule } from '../Logs/log.module';

@Module({
  imports: [DataServicesModule, LogsModule],
  providers: [
    ConnectionDataMapper,
    ConnectionUseCases,
    { provide: ConnectionRepository, useClass: ConnectionRepositoryMysql },
  ],
  exports: [ConnectionDataMapper, ConnectionUseCases],
})
export class ConnectionUseCasesModule {}
