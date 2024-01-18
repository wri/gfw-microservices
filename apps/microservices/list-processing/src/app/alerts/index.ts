import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, SqlModule } from '@wri-monorepos/sql';
import { AlertsRepository } from './alerts.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Organization], 'default'), SqlModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository, ConfigService],
})
export class DashboardModule {}
