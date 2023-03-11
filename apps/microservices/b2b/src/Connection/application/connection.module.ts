import { Module } from '@nestjs/common';
import { DataServicesModule } from '../../Shared/application/data-service/data-service.module';
import { ConnectionDataMapper } from './connection.mapper';
import { ConnectionUseCases } from './connection.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [ConnectionDataMapper, ConnectionUseCases],
  exports: [ConnectionDataMapper, ConnectionUseCases],
})
export class ConnectionUseCasesModule {}
