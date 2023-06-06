import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@wri-monorepos/shared';
import { DatabaseModule } from '../Database/database.module';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { MapperFindTypeORM } from '../Shared/infraestructure/typeorm/find.mapper';
import { MapperQueryTypeORM } from '../Shared/infraestructure/typeorm/query-builder.mapper';
import { OrganizationUseCases } from './application/organization.use-case';
import { Organization } from './domain/organization.entity';
import { OrganizationRepository } from './domain/organization.repository';
import { OrganizationRepositoryMssql } from './infrastructure/organization.repository.mssql';

@Module({
  imports: [
    DatabaseModule,
    SharedModule,
    DataServicesModule,
    TypeOrmModule.forFeature([Organization]),
  ],
  providers: [
    OrganizationUseCases,
    MapperQueryTypeORM,
    MapperFindTypeORM,
    { provide: OrganizationRepository, useClass: OrganizationRepositoryMssql },
  ],
  exports: [OrganizationUseCases],
})
export class OrganizationModule {}
