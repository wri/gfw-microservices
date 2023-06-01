import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../Database/database.module';
import { DataServicesModule } from '../Shared/application/data-service/data-service.module';
import { OrganizationUseCases } from './application/organization.use-case';
import { Organization } from './domain/organization.entity';
import { OrganizationRepository } from './domain/organization.repository';
import { OrganizationRepositoryMssql } from './infrastructure/organization.repository.mssql';

@Module({
  imports: [
    DatabaseModule,
    DataServicesModule,
    TypeOrmModule.forFeature([Organization]),
  ],
  providers: [
    OrganizationUseCases,
    { provide: OrganizationRepository, useClass: OrganizationRepositoryMssql },
  ],
  exports: [OrganizationUseCases],
})
export class OrganizationModule {}
