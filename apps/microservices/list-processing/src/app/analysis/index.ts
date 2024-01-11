import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, SqlModule } from '@wri-monorepos/sql';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Organization], 'default'), SqlModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
