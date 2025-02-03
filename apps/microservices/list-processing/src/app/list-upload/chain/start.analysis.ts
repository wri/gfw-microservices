import {
  ClientStoreConnection,
  Lists,
  ListSchema,
  ListSchemaType,
  updateListsAnalysisStatus,
  User,
} from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { MARK_IS_TEST_LIST, MARK_IS_TEST_USER } from '../../../services/constants';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import { mockAnalysisFlow } from '../../../mock';
import {
  extractAnalysisTypes,
  getListAnalysisStatusByListId,
  isGHGCommodityValid,
} from '@wri-monorepos/geo';
import { ProcessingLimitException } from '../../app.exceptions';
import { listStatus } from '@wri-monorepos/constants';
import {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} from '@wri-monorepos/constants';
import { Logger } from '@nestjs/common';
import { EntitySchema } from 'typeorm';

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

  async getAllLocationIds(request: ChainType) {
    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    await this.clientStoreConnection.clearCache(process.env.MSSQL_HOSTNAME + organizationDatabase);
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    const ids = await connection
      .createQueryBuilder()
      .select('list.locationId')
      .from(ListEntity, 'list')
      .getMany();

    // Extracting the locationIds from the result
    return ids.map((entity) => entity.locationId);
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

  private getGeoTrellisUrl(): string {
    const geoTrellisUrlsByEnv = {
      qa: GEO_TRELLIS__ANALYZE_LIST_QA,
      staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
      production: GEO_TRELLIS__ANALYZE_LIST_PROD,
      ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
      default: GEO_TRELLIS__ANALYZE_LIST_DEV,
    };
    return geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;
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

  private async checkProcessingLimits(
    organization_database: string,
    organizationId: number,
    subscriptionStatusId: number,
    listId: number
  ): Promise<{ isListLocationOverLimit: boolean; processingLimit: number }> {
    return await checkProcessingLimits({
      organizationDb: organization_database,
      organizationId,
      subscriptionStatusId,
      listId,
    });
  }

  private async handleExceededAnalysisLimit(
    organization_database: string,
    listId: number
  ): Promise<void> {
    await updateListsAnalysisStatus(organization_database, {
      listId,
      errorInfo: 'Exceeded Analysis Limit',
      status: listStatus.Inactive,
    });
  }

  private async getAnalysisTypes(
    organization_database: string,
    listId: number
  ): Promise<Record<string, boolean>> {
    const listAnalysisStatusData = await getListAnalysisStatusByListId(
      organization_database,
      listId
    );
    return extractAnalysisTypes(listAnalysisStatusData);
  }

  private createPayloadBody(
    listId: number,
    user_id: number,
    organizationId: number,
    isExternalAPIProcess: boolean,
    processingLimit: number,
    analysis_types: Record<string, boolean>,
    ids: Array<number>
  ): object {
    return {
      list_id: listId,
      user_id,
      organization_id: organizationId,
      send_email: !isExternalAPIProcess,
      processing_limit: processingLimit,
      analysis_types,
      reanalyze: false,
      location_id: ids,
    };
  }

  private createFetchOptions(payloadBody: object): object {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadBody),
    };
  }

  private async mockAnalysisFlow(organization_database: string, listId: number): Promise<void> {
    await mockAnalysisFlow({
      organization_database: organization_database,
      list_id: listId,
      template_type: 'cocoa_generic',
    });
  }

  private async performAnalysis(geoTrellisUrl: string, options: object): Promise<void> {
    const response = await fetch(geoTrellisUrl, options);
    await response.json();
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
    } = request.request as RequestNewList;

    // Check if the commodity is valid for GHG Analysis
    await isGHGCommodityValid(listId, organization_database);

    const isDraft = await this.isDraftList(saveAsDraft, organization_database, listId);
    if (isDraft) {
      return request;
    }

    this.validateGeoJsonFeatures(request.geojson.features);

    const geoTrellisUrl = this.getGeoTrellisUrl();
    const microserviceEnvironment = process.env.MICROSERVICES_ENV;

    const { listName, userEmail } = await this.getTestFlowDetails(
      microserviceEnvironment,
      organization_database,
      listId,
      user_id
    );
    const isTestFlow = this.isTestFlow(microserviceEnvironment, listName, userEmail);

    const { isListLocationOverLimit, processingLimit } = await this.checkProcessingLimits(
      organization_database,
      organizationId,
      subscriptionStatusId,
      listId
    );

    if (isListLocationOverLimit) {
      await this.handleExceededAnalysisLimit(organization_database, listId);
      throw new ProcessingLimitException();
    }

    const analysis_types = await this.getAnalysisTypes(organization_database, listId);
    const ids = await this.getAllLocationIds(request);

    const payloadBody = this.createPayloadBody(
      listId,
      user_id,
      organizationId,
      isExternalAPIProcess,
      processingLimit,
      analysis_types,
      ids
    );
    const options = this.createFetchOptions(payloadBody);

    if (isTestFlow) {
      await this.mockAnalysisFlow(organization_database, listId);
      return request;
    }

    await this.performAnalysis(geoTrellisUrl, options);
    return request;
  }
}
