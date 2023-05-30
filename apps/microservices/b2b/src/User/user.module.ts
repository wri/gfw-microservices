import { Module } from '@nestjs/common';
import { ListModule } from '../List/list.module';
import { UserUseCases } from './application/user.use-case';
import { UserRepository } from './domain/user.repository';
import { UserRepositoryMysql } from './infrastructure/user.repository.mysql';

@Module({
  imports: [ListModule],
  providers: [
    { provide: UserRepository, useClass: UserRepositoryMysql },
    UserUseCases,
  ],
  exports: [UserRepository, UserUseCases],
})
export class UserModule {}
