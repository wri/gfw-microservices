import { Injectable } from '@nestjs/common';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { Organization } from '../domain/organization.entity';

import { OrganizationRepository } from '../domain/organization.repository';


@Injectable()
export class OrganizationUseCases {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async findById(id: number): ResultPromise<Organization | undefined> {
    return this.organizationRepository.findById(id);
  }

  async getAll(): ResultPromise<Organization[]> {
    return this.organizationRepository.findByFilters({});
  }
}