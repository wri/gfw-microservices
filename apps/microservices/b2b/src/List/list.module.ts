import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../Database/database.module';
import { OrganizationModule } from '../Organization/organization.module';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { MapperQueryTypeORM } from '../Shared/infraestructure/typeorm/query-builder.mapper';
import { SharedModule } from '../Shared/shared.module';
import { ListDataMapper } from './application/list.mapper';
import { ListUseCases } from './application/list.use-case';
import { List } from './domain/list.entity';
import { ListRepository } from './domain/list.repository';
import { ListRepositoryMysql } from './infrastructure/list.repository.mysql';

@Module({
  imports: [
    DatabaseModule,
    DataServicesModule,
    SharedModule,
    OrganizationModule,
    TypeOrmModule.forFeature([List]),
  ],
  providers: [
    ListDataMapper,
    MapperQueryTypeORM,
    ListUseCases,
    { provide: ListRepository, useClass: ListRepositoryMysql },
  ],
  exports: [ListDataMapper, ListUseCases],
})
export class ListModule {}
