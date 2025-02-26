import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, Lists, ListsAnalysisStatus } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import { In } from 'typeorm';

export class PutListAsDraft extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(PutListAsDraft.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { request } = input;
    const {
      saveAsDraft,
      organization_database,
      list_id,
      analysisIds,
      hasUnanalyzableError = false,
    } = request as RequestNewList;

    if (saveAsDraft) {
      return input;
    }

    if (hasUnanalyzableError) {
      this.logger.error('Should put list as draft, has invalid coordinates or polygon geometry');

      if (organization_database && list_id) {
        await this.putListAsDraft(organization_database, list_id);
        await this.setListAnalysisStatusAsDraft(organization_database, list_id, analysisIds);
      }

      return {
        ...input,
        request: { ...request, saveAsDraft: true },
      };
    }
    return input;
  }

  async putListAsDraft(organizationDatabase: string, list_id: number) {
    this.logger.log(`Putting list ${list_id} status as draft`);
    const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    await listRepository.update({ id: list_id }, { listStatusId: listStatus.Draft });
  }

  async setListAnalysisStatusAsDraft(
    organizationDatabase: string,
    list_id: number,
    analysisIds: string[]
  ) {
    const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    await listAnalysisStatusRepository.update(
      { listId: list_id, analysisId: In(analysisIds) },
      { status: listStatus.Draft }
    );
  }
}
