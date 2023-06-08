import { Inject, Injectable } from '@nestjs/common';
import { OrganizationUseCases } from '../../Organization/application/organization.use-case';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import {} from '../../SharedList/domain/shared-list.repository';
import { List } from '../domain/list.entity';
import { ListRepository } from '../domain/list.repository';

@Injectable()
export class ListUseCases {
  @Inject(OrganizationUseCases)
  private readonly organizationUseCases: OrganizationUseCases;

  constructor(private readonly listRepository: ListRepository) {}

  async findListsByFilters(
    filters: { [key in string]: string | boolean },
    orgId: number,
  ): ResultPromise<List[]> {
    const orgRes = await this.organizationUseCases.findById(orgId);
    if (orgRes.isFailure) return Result.fail(orgRes.getError());
    const org = orgRes.getValue();
    const lists = await this.listRepository.findListsByFilters(
      filters,
      org.organizationDb,
    );
    return lists;
  }

  async findListById(
    id: number,
    orgId: number,
  ): ResultPromise<List | undefined> {
    const orgRes = await this.organizationUseCases.findById(orgId);
    if (orgRes.isFailure) return Result.fail(orgRes.getError());
    const org = orgRes.getValue();
    const list = await this.listRepository.findListById(id, org.organizationDb);
    return list;
  }
}
