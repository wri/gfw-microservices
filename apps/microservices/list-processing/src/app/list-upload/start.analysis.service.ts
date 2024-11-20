import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(@InjectQueue('analysis') private readonly analysisQueue: Queue) {}

  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    await this.analysisQueue.add('start-analysis', request);
    return {
      executionArn: '',
      startDate: '',
    };
  }
}
