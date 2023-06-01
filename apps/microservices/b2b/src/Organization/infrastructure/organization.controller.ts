import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { OrganizationUseCases } from '../application/organization.use-case';
import { Organization } from '../domain/organization.entity';

@Controller('api/organizations')
export class OrganizationController {
  constructor(private readonly organizationUseCases: OrganizationUseCases) {}

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Organization | undefined> {
    const res = await this.organizationUseCases.findById(id);
    if (res.isSuccess) return res.getValue();
    const error = res.getError();
    throw new HttpException(error.message, error.code);
  }

  @Get()
  async getAll(): Promise<Organization[]> {
    const res = await this.organizationUseCases.getAll();
    if (res.isSuccess) return res.getValue();
    const error = res.getError();
    throw new HttpException(error.message, error.code);
  }
}
