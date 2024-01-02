import { Module } from '@nestjs/common';
import { Task } from './task';
import { UnlockListService } from './unlock.list.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OrganizationService } from './organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Organization } from '@wri-monorepos/sql';
import { ListService } from './list.service';
import { SqlModule } from '@wri-monorepos/sql';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Organization], 'default'),
    ScheduleModule.forRoot(),
    SqlModule,
  ],
  controllers: [],
  providers: [Task, UnlockListService, OrganizationService, ListService],
})
export class SchedulerModule {}
