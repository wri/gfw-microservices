/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { UspResetListStatus } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import { getUserEmail } from '../shared/user.utils';
import { EmailService } from '@wri-monorepos/aws';
import { setListAnalysisStatus } from '@wri-monorepos/geo';
import { ServerConfigType } from '../../../validators/server-config';
import { ConfigService } from '@nestjs/config';

export class PutListAsDraft extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(PutListAsDraft.name);

  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    private readonly emailService: EmailService
  ) {
    super();
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { request } = input;
    const {
      saveAsDraft,
      organization_database,
      list_id,
      user_id,
      analysisIds,
      list_name,
      hasUnanalyzableError = false,
      isExternalAPIProcess = false,
      organization_id: organizationId,
      options,
    } = request as RequestNewList;

    if (saveAsDraft) {
      return input;
    }

    if (hasUnanalyzableError) {
      this.logger.error('Should put list as draft');

      if (organization_database && list_id) {
        await this.putListAsDraft(organization_database, list_id);
        await setListAnalysisStatus(
          organization_database,
          list_id,
          analysisIds,
          listStatus.Draft,
          organizationId,
          options
        );

        if (!isExternalAPIProcess && user_id) {
          const userEmail = await getUserEmail(organization_database, user_id);
          try {
            await this.emailService.sendEmail(
              this.config.get('SES_SENDER_EMAIL'),
              [userEmail],
              'Error Submitting for Analysis',
              'listUploadError',
              { listName: list_name }
            );
          } catch (error) {
            this.logger.error('Failed to send email', error.stack || error);
          }
        }
      }

      return {
        ...input,
        request: { ...request, saveAsDraft: true },
      };
    }
    return input;
  }

  async putListAsDraft(organizationDatabase, list_id, gfwListId = undefined) {
    this.logger.log(`Putting list ${list_id} status as draft`);
    return new UspResetListStatus().run(organizationDatabase, list_id, listStatus.Draft, gfwListId);
  }
}
