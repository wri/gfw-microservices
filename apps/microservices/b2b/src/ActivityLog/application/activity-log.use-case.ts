import { Inject, Injectable } from '@nestjs/common';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { UserRepository } from '../../User/domain/user.repository';
import { UserUseCases } from '../../User/application/user.use-case';
import { ActivityLogRepository } from '../domain/activity-log.repository';
import { ActivityLogDataMapper } from './activity-log.mapper';
import { ActivityLogDto } from './dtos/activity-log.dto';
import { ERRORS } from '../../Shared/domain/constants';
import { ConstantsConfigIds, B2bStatus } from '@wri-monorepos/constants';

@Injectable()
export class ActivityLogUseCases {
  constructor (
    private logRepo: ActivityLogRepository,
    private userRepo: UserRepository,
    private mapper: ActivityLogDataMapper,
    @Inject(ConstantsConfigIds.B2B_STATUS) private b2bStatusValues: B2bStatus,
  ) { }

  @Inject(UserUseCases)
  private readonly userUseCases: UserUseCases;

  async saveActivityLog(logDto: ActivityLogDto): ResultPromise<boolean> {
    const checkActivityType = Object.values(this.b2bStatusValues).some(
      (activityType) => activityType === Number(logDto.activityType),
    );

    if (!checkActivityType) {
      return Result.fail(ERRORS.BAD_REQUEST);
    }

    const dbRes = await this.userUseCases.getUserDB(
      logDto.userEmail,
      logDto.organizationTarget,
    );

    if (dbRes.isFailure) {
      return Result.fail(dbRes.getError());
    }

    const db = dbRes.getValue();
    const logRes = await this.mapper.createLog(logDto, db, this.userRepo);

    if (logRes.isFailure) {
      return Result.fail(logRes.getError());
    }
    const log = logRes.getValue();
    const result = await this.logRepo.saveActivityLog(log, db);

    if (result.isSuccess) {
      return Result.ok(true);
    }
    return Result.fail(result.getError());
  }
}
