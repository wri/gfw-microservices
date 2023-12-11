import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UnlockListService } from './unlock.list.service';

@Injectable()
export class Task {
  private readonly logger = new Logger(Task.name);

  constructor(private unlockListService: UnlockListService) {}

  // Run every day at 3 AM
  @Cron('0 0 3 * * *')
  async runTaskEveryDay() {
    this.logger.log('Running daily tasks at 3 AM');
    await this.unlockListService.execute();
  }
}
