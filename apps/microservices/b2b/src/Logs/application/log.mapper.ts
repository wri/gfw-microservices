import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as sql from 'mssql';
import { LogActivityDto } from '../application/dtos/log.dto';
import { Log } from '../domain/log';
import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';
import { UserRepository } from '../../User/domain/user.repository';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import ResultError from '../../Shared/domain/result/result.error';

export class LogDataMapper {
  async createLog(
    logDto: LogActivityDto,
    db: string,
    userRepository: UserRepository,
  ): ResultPromise<Log> {
    const userResponse = await userRepository.getUserByEmail(
      logDto.userEmail,
      db,
    );
    if (userResponse.isFailure) {
      Logger.log('Error while getting user to save log');
      return Result.fail(
        new ResultError('Error while getting user to save log', 500),
      );
    }
    const user = userResponse.getValue();

    //const user: User = plainToInstance(User, { email: logDto.userEmail });
    return Result.ok(
      plainToInstance(Log, {
        user: user.id,
        type: logDto.activityType,
        description: logDto.description,
        time: new Date(),
      }),
    );
  }

  toProcedureParam(log: Log): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [
      {
        field: 'userID',
        type: sql.Int(),
        value: log.user,
      },
      { field: 'activityTypeID', type: sql.Int(), value: log.type },
      {
        field: 'activityDescription',
        type: sql.NVarChar(sql.MAX),
        value: log.description,
      },
      { field: 'activityTime', type: sql.DateTime(), value: log.time },
    ];

    return params;
  }
}
