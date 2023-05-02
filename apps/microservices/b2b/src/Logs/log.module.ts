import { Module } from '@nestjs/common';
import { UserMapper } from '../User/application/user.mapper';
import { UserRepository } from '../User/domain/user.repository';
import { UserRepositoryMysql } from '../User/infrastructure/user.repository.mysql';
import { UserModule } from '../User/user.module';
import { LogDataMapper } from './application/log.mapper';
import { LogsUseCases } from './application/log.use-case';
import { LogsRepository } from './domain/log.repository';
import { LogRepositoryMysql } from './infrastructure/logs.repository.mysql';

@Module({
  imports: [UserModule],
  providers: [
    { provide: LogsRepository, useClass: LogRepositoryMysql },
    { provide: UserRepository, useClass: UserRepositoryMysql },
    LogDataMapper,
    LogsUseCases,
  ],
  exports: [LogsUseCases],
})
export class LogsModule {}
