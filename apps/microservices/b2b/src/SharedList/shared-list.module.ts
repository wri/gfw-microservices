import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@wri-monorepos/shared';
import { ConnectionModule } from '../Connection/connection.module';
import { DatabaseModule } from '../Database/database.module';
import { ListModule } from '../List/list.module';
import { OrganizationModule } from '../Organization/organization.module';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { MapperQueryTypeORM } from '../Shared/infraestructure/typeorm/query.mapper';
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
    SharedModule,
    UserModule,
    ListModule,
    TypeOrmModule.forFeature([SharedList]),
  ],
  providers: [
    SharedListUseCases,
    MapperQueryTypeORM,
    { provide: SharedListRepository, useClass: SharedListRepositoryMssql },
  ],
  exports: [SharedListUseCases],
})
export class SharedListModule {}
