import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { handleCreateAnalysis } from '@wri-monorepos/geo';
import { listStatus } from '@wri-monorepos/constants';

import { Logger } from '@nestjs/common';

export class StartAnalysis extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(StartAnalysis.name);
  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async getListStatus(organizationDatabase: string, list_id: number) {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { listStatusId } = await listRepository.findOne({ where: { id: list_id } });
    return listStatusId;
  }

  private async isDraftList(
    saveAsDraft: boolean,
    organizationDatabase: string,
    listId: number
  ): Promise<boolean> {
    const listStatusId = await this.getListStatus(organizationDatabase, listId);
    if (saveAsDraft || listStatusId === listStatus.Draft) {
      return true;
    }
    return false;
  }

  private validateGeoJsonFeatures(features: any[]): void {
    const listSizeWithoutError = features?.filter(
      (feature) => !feature?.properties?.error && feature?.properties?.gadmid
    ).length;
    if (listSizeWithoutError === 0) {
      throw new Error('All the features have errors, not going to start the analysis');
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const {
      organization_database,
      user_id,
      list_id: listId,
      isExternalAPIProcess,
      organization_id: organizationId,
      subscription_status_id: subscriptionStatusId,
      saveAsDraft,
      analysisIds,
    } = request.request as RequestNewList;

    const isDraft = await this.isDraftList(saveAsDraft, organization_database, listId);
    if (isDraft) {
      this.logger.debug(`List ${listId} is set as draft so going to skip analysis`);
      return request;
    }

    this.validateGeoJsonFeatures(request.geojson.features);

    const analysisTypesToProcess = analysisIds.join(',');
    const result = await handleCreateAnalysis(
      analysisTypesToProcess,
      listId,
      organizationId,
      organization_database,
      isExternalAPIProcess ? null : '',
      user_id,
      subscriptionStatusId,
      false
    );

    if (result !== 'OK' && result !== 'Created') {
      throw new Error(`Failed to start analysis: ${result}`);
    }

    return request;
  }
}
