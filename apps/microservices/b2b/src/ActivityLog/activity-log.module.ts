import { Module } from '@nestjs/common';
import { UserRepository } from '../User/domain/user.repository';
import { UserRepositoryMysql } from '../User/infrastructure/user.repository.mysql';
import { UserModule } from '../User/user.module';
import { ActivityLogDataMapper } from './application/activity-log.mapper';
import { ActivityLogUseCases } from './application/activity-log.use-case';
import { ActivityLogRepository } from './domain/activity-log.repository';
import { ActivityLogRepositoryMysql } from './infrastructure/activity-log.repository.mysql';
import {
  ConstantsConfig,
  ConstantsConfigIds,
} from '../../../../../libs/constants';

@Module({
  imports: [UserModule],
  providers: [
    { provide: ActivityLogRepository, useClass: ActivityLogRepositoryMysql },
    { provide: UserRepository, useClass: UserRepositoryMysql },
    ConstantsConfig[ConstantsConfigIds.B2B_STATUS],
    ActivityLogDataMapper,
    ActivityLogUseCases,
  ],
  exports: [ActivityLogUseCases],
})
export class ActivityLogModule {}
