import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UnlockListService } from './unlock.list.service';

@Injectable()
export class Task {
  private readonly logger = new Logger(Task.name);

  constructor(private unlockListService: UnlockListService) {}

  @Cron('0 * * * * *')
  async runTaskEveryDay() {
    this.logger.log('Run task every day');
    await this.unlockListService.execute();
  }
}
