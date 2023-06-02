import { Module } from '@nestjs/common';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { ConnectionRepositorySP } from './domain/connection.repository.sp';
import { ConnectionDataMapper } from './application/connection.mapper';
import { ConnectionUseCases } from './application/connection.use-case';
import { LogsModule } from '../Logs/log.module';
import { ConnectionRepositoryMssqlSP } from './infraestructure/connection.repository.mssql.sp';
import { AwsModule } from '@wri-monorepos/aws';
import { ConnectionRequestRepository } from './domain/connection.repository';
import { ConnectionRequestRepositoryMssql } from './infraestructure/connection.repository.mssql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionRequest } from './domain/connection.entity';
import { DatabaseModule } from '../Database/database.module';
import { SharedModule } from '../Shared/shared.module';

@Module({
  imports: [
    DatabaseModule,
    AwsModule,
    DataServicesModule,
    LogsModule,
    SharedModule,
    TypeOrmModule.forFeature([ConnectionRequest]),
  ],
  providers: [
    ConnectionDataMapper,
    ConnectionUseCases,
    { provide: ConnectionRepositorySP, useClass: ConnectionRepositoryMssqlSP },
    {
      provide: ConnectionRequestRepository,
      useClass: ConnectionRequestRepositoryMssql,
    },
  ],
  exports: [ConnectionDataMapper, ConnectionUseCases],
})
export class ConnectionModule {}
