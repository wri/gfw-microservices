import { Module } from '@nestjs/common';
import { Task } from './task';
import { UnlockListService } from './unlock.list.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OrganizationService } from './organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '@wri-monorepos/sql';
import { ListService } from './list.service';
import { SqlModule } from '@wri-monorepos/sql';
import { LockListService } from './lock.list.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization], 'default'),
    ScheduleModule.forRoot(),
    SqlModule,
  ],
  controllers: [],
  providers: [Task, UnlockListService, OrganizationService, ListService, LockListService],
})
export class SchedulerModule {}
