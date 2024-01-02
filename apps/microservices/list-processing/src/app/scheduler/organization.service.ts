import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization, 'default')
    private organizationRepository: Repository<Organization>
  ) {}

  async findAll(): Promise<Array<Organization>> {
    return await this.organizationRepository.find();
  }
}
