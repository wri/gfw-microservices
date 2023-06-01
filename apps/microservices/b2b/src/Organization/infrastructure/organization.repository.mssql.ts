import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { MultiConnectRepository } from '../../Shared/infraestructure/typeorm/multi-connect.repository';
import { Organization } from '../domain/organization.entity';
import { OrganizationRepository } from '../domain/organization.repository';

@Injectable()
export class OrganizationRepositoryMssql
  extends MultiConnectRepository<Organization>
  implements OrganizationRepository
{
  constructor(
    @InjectRepository(Organization)
    repository: Repository<Organization>,
  ) {
    super(repository);
  }

  async findByFilters(filters: any): ResultPromise<Organization[]> {
    const query = this.repository
      .createQueryBuilder('organizations')
      .where(filters);
    query.orderBy('organizations.organizationName', 'ASC');
    const organizations = await query.getMany();
    return Result.ok(organizations);
  }

  async findById(id: number): ResultPromise<Organization | undefined> {
    const organization = await this.repository.findOneBy({ id });
    return Result.ok(organization);
  }
}
