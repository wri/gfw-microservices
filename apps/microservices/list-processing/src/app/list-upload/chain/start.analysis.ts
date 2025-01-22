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
  validateGHGCommodity,
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

  async handle(request: ChainType): Promise<ChainType> {
    const {
      organization_database,
      user_id,
      list_id: listId,
      isExternalAPIProcess,
      organization_id: organizationId,
      subscription_status_id: subscriptionStatusId,
    } = request.request as RequestNewList;

    const listSizeWithoutError = request.geojson.features?.filter(
      (feature) => !feature?.properties?.error && feature?.properties?.gadmid
    ).length;
    if (listSizeWithoutError === 0) {
      throw new Error('All the features have errors, not going to start the analysis');
    }

    const geoTrellisUrlsByEnv = {
      qa: GEO_TRELLIS__ANALYZE_LIST_QA,
      staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
      production: GEO_TRELLIS__ANALYZE_LIST_PROD,
      ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
      default: GEO_TRELLIS__ANALYZE_LIST_DEV,
    };
    const geoTrellisUrl = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;
    const microserviceEnvironment = process.env.MICROSERVICES_ENV;

    let listName = '';
    let userEmail = '';

    if (environmentAllowTestFlow.includes(microserviceEnvironment)) {
      listName = await this.getListName(organization_database, listId);
      userEmail = await this.getUserEmail(organization_database, user_id);
    }

    const isTestFlow =
      environmentAllowTestFlow.includes(microserviceEnvironment) &&
      listName.includes(MARK_IS_TEST_LIST) &&
      userEmail.includes(MARK_IS_TEST_USER);

    const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
      organizationDb: organization_database,
      organizationId,
      subscriptionStatusId,
      listId,
    });

    // Check if the commodity is valid for GHG Analysis
    if (await validateGHGCommodity(listId, organization_database)) {
      Logger.log(`Commodity is valid for GHG Analysis`);
    }

    if (isListLocationOverLimit) {
      await updateListsAnalysisStatus(organization_database, {
        listId,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
      });
      throw new ProcessingLimitException();
    }

    const listAnalysisStatusData = await getListAnalysisStatusByListId(
      organization_database,
      listId
    );
    const analysis_types = extractAnalysisTypes(listAnalysisStatusData);

    const ids = await this.getAllLocationIds(request);

    const payloadBody = {
      list_id: listId,
      user_id,
      organization_id: organizationId,
      send_email: !isExternalAPIProcess,
      processing_limit: processingLimit,
      analysis_types,
      reanalyze: false,
      location_id: ids,
    };

    const requestBody = JSON.stringify(payloadBody);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    };

    // Flow used by cypress test, mock analysis flow so avoid call lambda functions.
    if (isTestFlow) {
      await mockAnalysisFlow({
        organization_database: organization_database,
        list_id: listId,
        template_type: 'cocoa_generic',
      });
      return request;
    }

    const response = await fetch(geoTrellisUrl, options);
    await response.json();
    return request;
  }
}
