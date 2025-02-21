import { ClientStoreConnection, Lists, User } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { MARK_IS_TEST_LIST, MARK_IS_TEST_USER } from '../../../services/constants';
import { mockAnalysisFlow } from '../../../mock';
import { isGHGCommodityValid, handleCreateAnalysis } from '@wri-monorepos/geo';
import { ListAnalysisIds, listStatus } from '@wri-monorepos/constants';

import { Logger } from '@nestjs/common';

const environmentAllowTestFlow = ['DEVELOPMENT', 'LATEST', 'QA', 'STAGING'];

export class StartAnalysis extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(StartAnalysis.name);
  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async getListName(organizationDatabase: string, list_id: number) {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { listName } = await listRepository.findOne({ where: { id: list_id } });
    return listName;
  }

  async getListStatus(organizationDatabase: string, list_id: number) {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { listStatusId } = await listRepository.findOne({ where: { id: list_id } });
    return listStatusId;
  }

  async getUserEmail(organizationDatabase: string, user_id: number) {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const userRepository = connection.getRepository(User);
    const { email } = await userRepository.findOne({ where: { id: user_id } });
    return email;
  }

  private async isDraftList(
    saveAsDraft: boolean,
    organizationDatabase: string,
    listId: number
  ): Promise<boolean> {
    const listStatusId = await this.getListStatus(organizationDatabase, listId);
    if (saveAsDraft || listStatusId === listStatus.Draft) {
      this.logger.debug(`List ${listId} is set as draft so going to skip analysis`);
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

  private async getTestFlowDetails(
    microserviceEnvironment: string,
    organization_database: string,
    listId: number,
    user_id: number
  ): Promise<{ listName: string; userEmail: string }> {
    let listName = '';
    let userEmail = '';

    if (environmentAllowTestFlow.includes(microserviceEnvironment)) {
      listName = await this.getListName(organization_database, listId);
      userEmail = await this.getUserEmail(organization_database, user_id);
    }

    return { listName, userEmail };
  }

  private isTestFlow(
    microserviceEnvironment: string,
    listName: string,
    userEmail: string
  ): boolean {
    return (
      environmentAllowTestFlow.includes(microserviceEnvironment) &&
      listName.includes(MARK_IS_TEST_LIST) &&
      userEmail.includes(MARK_IS_TEST_USER)
    );
  }

  private async mockAnalysisFlow(organization_database: string, listId: number): Promise<void> {
    await mockAnalysisFlow({
      organization_database: organization_database,
      list_id: listId,
      template_type: 'cocoa_generic',
    });
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
      return request;
    }

    this.validateGeoJsonFeatures(request.geojson.features);

    const microserviceEnvironment = process.env.MICROSERVICES_ENV;
    const { listName, userEmail: testUserEmail } = await this.getTestFlowDetails(
      microserviceEnvironment,
      organization_database,
      listId,
      user_id
    );
    const isTestFlow = this.isTestFlow(microserviceEnvironment, listName, testUserEmail);

    if (isTestFlow) {
      await this.mockAnalysisFlow(organization_database, listId);
      return request;
    }

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
