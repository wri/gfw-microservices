import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, SqlModule } from '@wri-monorepos/sql';
import { DashboardRepository } from './dashboard.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Organization], 'default'), SqlModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, ConfigService],
})
export class DashboardModule {}
