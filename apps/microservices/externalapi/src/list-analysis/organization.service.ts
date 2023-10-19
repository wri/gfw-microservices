import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../api-keys/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization, 'default')
    private organizationRepository: Repository<Organization>
  ) {}

  async findOrganizationById(id: number): Promise<Organization> {
    return await this.organizationRepository.findOne({ where: { id } });
  }
}
