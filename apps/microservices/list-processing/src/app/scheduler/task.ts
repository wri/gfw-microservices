import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UnlockListService } from './unlock.list.service';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class Task {
  private readonly logger = new Logger(Task.name);

  constructor(private unlockListService: UnlockListService) {}

  // Run every day at 1 AM UTC
  @Cron('0 0 1 * * *')
  async performingDailyTasks() {
    this.logger.log(
      `Performing daily tasks, executed at: ${formatInTimeZone(
        new Date(),
        'UTC',
        'yyyy-MM-dd HH:mm:ss'
      )}`
    );

    // Random delay between 0 and 2 hours to reduce collision probability across multiple instances
    const randomDelay = Math.floor(Math.random() * 1000 * 60 * 60 * 2);
    const delayMinutes = Math.floor(randomDelay / (1000 * 60));
    this.logger.log(`Random delay: ${delayMinutes} minutes (${randomDelay} ms)`);

    await this.delay(randomDelay);
    await this.unlockListService.execute();
  }

  delay(t) {
    return new Promise(function (resolve) {
      setTimeout(() => {
        resolve('delayed');
      }, t);
    });
  }
}
