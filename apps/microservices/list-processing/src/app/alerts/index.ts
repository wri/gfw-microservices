import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './alerts.repository';
import { ConfigModule } from '@nestjs/config';
import { GFWList, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [ConfigModule, SqlModule, TypeOrmModule.forFeature([GFWList], 'default')],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
