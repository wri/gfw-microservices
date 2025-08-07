/**
 * This code is deprecated and will be removed in the future.
 * The new implementation is in the list-upload/start.analysis.service.ts file.
 * This code is used when the feature flag UploadListLp is disabled.
 * So current we are still using this code in production.
 */
import { Injectable } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import {
  extractAnalysisTypes,
  getListAnalysisStatusByListId,
  MARK_IS_TEST_LIST,
  MARK_IS_TEST_USER,
  mockAnalysisFlow,
} from '@wri-monorepos/geo';
import moment from 'moment';
import { ClientStoreConnection, Lists, updateListsAnalysisStatus, User } from '@wri-monorepos/sql';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import { ProcessingLimitException } from '../app.exceptions';
import { listStatus } from '@wri-monorepos/constants';

const environmentAllowTestFlow = ['DEVELOPMENT', 'LATEST', 'QA', 'STAGING'];

@Injectable()
export class DeprecatedStartAnalysisService {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const largeListProcessingEndPoint = this.config.get('LARGE_LIST_PROCESSING_ENDPOINT', {
      infer: true,
    });
    const microserviceEnvironment = this.config.get('MICROSERVICES_ENV', { infer: true });

    let listName = '';
    let userEmail = '';

    if (environmentAllowTestFlow.includes(microserviceEnvironment)) {
      listName = await this.getListName(request.organization_database, request.list_id);
      userEmail = await this.getUserEmail(request.organization_database, request.user_id);
    }

    const isTestFlow =
      environmentAllowTestFlow.includes(microserviceEnvironment) &&
      listName.includes(MARK_IS_TEST_LIST) &&
      userEmail.includes(MARK_IS_TEST_USER);

    const { isExternalAPIProcess, ...llpRequest } = request;
    const { organization_id: organizationId, subscription_status_id: subscriptionStatusId } =
      request;

    const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
      organizationDb: request.organization_database,
      organizationId,
      subscriptionStatusId,
      listId: request.list_id,
    });

    const listAnalysisStatusData = await getListAnalysisStatusByListId(
      request.organization_database,
      request.list_id
    );
    const analysis_types = extractAnalysisTypes(listAnalysisStatusData);

    if (isListLocationOverLimit) {
      await updateListsAnalysisStatus(request.organization_database, {
        listId: request.list_id,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
        analysisIds: Object.keys(analysis_types),
      });
      throw new ProcessingLimitException();
    }

    const payloadBody = {
      ...llpRequest,
      environment: microserviceEnvironment,
      send_email: !isExternalAPIProcess,
      processing_limit: processingLimit,
      analysis_types,
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
        organization_database: request.organization_database,
        list_id: request.list_id,
        template_type: request.template_type,
      });
      return Promise.resolve({
        executionArn: 'e2e_automation_fake_analysis',
        startDate: moment().format('YYYY-MM-DD'),
      });
    }

    const response = await fetch(largeListProcessingEndPoint, options);
    const responseBody = await response.json();
    return responseBody;
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
}