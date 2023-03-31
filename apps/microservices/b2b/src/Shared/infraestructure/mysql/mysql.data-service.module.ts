import { Module } from '@nestjs/common';
import { ConnectionRepositoryMysql } from '../../../Connection/infrastructure/connection.repository.mysql';
import { InvitationRepositoryMysql } from '../../../Invitation/infrastructure/invitation.repository.mysql';
import { DataServicesModule } from '../../application/data-service/data-service.module';
import { DataServicesService } from '../../application/data-service/data-services.service';
import { DataServices } from '../../domain/data-service';

@Module({
  imports: [],
  providers: [
    {
      provide: DataServices,
      useClass: DataServicesService,
    },
  ],
  exports: [DataServices],
})
export class MySqlDataServicesModule {}
