import { Module } from '@nestjs/common';
import { MySqlDataServicesModule } from '../../infraestructure/mysql/mysql.data-service.module';

@Module({
  imports: [MySqlDataServicesModule],
  exports: [MySqlDataServicesModule],
})
export class DataServicesModule {}
