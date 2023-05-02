import { Module } from '@nestjs/common';
import { UserMapper } from './application/user.mapper';
import { UserUseCases } from './application/user.use-case';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryMysql } from './infrastructure/user.repository.mysql';

@Module({
  providers: [
    { provide: UserRepository, useClass: UserRepositoryMysql },
    UserUseCases,
  ],
  exports: [UserRepository, UserUseCases],
})
export class UserModule {}
