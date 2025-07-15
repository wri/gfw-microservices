import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService } from '@wri-monorepos/aws';
import { upgradeListSchema } from '@wri-monorepos/sql';
import { logExecutionTime } from './chain/shared';
import { CommodityService } from '../commodity/commodity.service';
import { QueueService } from './queue.service';

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    @Inject(forwardRef(() => CommodityService))
    private readonly commodityService: CommodityService,
    private readonly emailService: EmailService,
    private readonly queueService: QueueService
  ) {}

  @logExecutionTime(StartAnalysisService.name)
  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const {
      list_id: listId,
      commodity,
      organization_database: clientDatabase,
      user_id: userId,
    } = request;

    if (listId) {
      const listExistAtClientStore =
        await this.commodityService.checkIfListExistAndCommodityIsTheSame(
          listId,
          commodity,
          clientDatabase
        );
      if (!listExistAtClientStore) {
        this.logger.warn(`List not found with id ${listId} at client store`);
        throw new Error(`List not found with id ${listId} at client store`);
      } else {
        this.logger.log(`List ${listId} found at client store`);
        // Upgrade the list schema to the latest version
        await upgradeListSchema({
          clientDb: clientDatabase,
          listId: listId,
          userId: userId,
        });
      }
    }

    // Use the global queue service instead of creating a new queue per request
    const stats = this.queueService.getQueueStats();
    this.logger.log(`Adding request to global queue. Current stats: ${JSON.stringify(stats)}`);

    // Process through the global queue (this returns a promise)
    await this.queueService.processRequest(request, this.config, this.emailService);

    return {
      executionArn: '',
      startDate: new Date().toISOString(),
    };
  }
}
