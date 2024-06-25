import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './alerts.repository';
import { ClientStoreConnection, GFWList, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SqlModule, TypeOrmModule.forFeature([GFWList], 'default')],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository, ClientStoreConnection],
})
export class AlertsModule {}
