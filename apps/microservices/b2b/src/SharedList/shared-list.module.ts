import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from '../Connection/connection.module';
import { DatabaseModule } from '../Database/database.module';
import { ListDataMapper } from '../List/application/list.mapper';
import { ListUseCases } from '../List/application/list.use-case';
import { ListModule } from '../List/list.module';
import { OrganizationModule } from '../Organization/organization.module';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { UserModule } from '../User/user.module';
import { SharedListUseCases } from './application/shared-list.use-case';
import { SharedList } from './domain/shared-list.entity';
import { SharedListRepository } from './domain/shared-list.repository';
import { SharedListRepositoryMssql } from './infrastructure/shared-list.repository.mssql';

@Module({
  imports: [
    DatabaseModule,
    DataServicesModule,
    OrganizationModule,
    ConnectionModule,
    UserModule,
    ListModule,
    TypeOrmModule.forFeature([SharedList]),
  ],
  providers: [
    SharedListUseCases,
    { provide: SharedListRepository, useClass: SharedListRepositoryMssql },
  ],
  exports: [SharedListUseCases],
})
export class SharedListModule {}
