import { Module } from '@nestjs/common';
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
