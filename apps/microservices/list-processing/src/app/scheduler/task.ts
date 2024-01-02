import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UnlockListService } from './unlock.list.service';
import * as moment from 'moment';

@Injectable()
export class Task {
  private readonly logger = new Logger(Task.name);

  constructor(private unlockListService: UnlockListService) {}

  // Run every day at 3 AM
  @Cron('0 0 3 * * *')
  async performingDailyTasks() {
    this.logger.log(
      `Performing daily tasks, executed at: ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`
    );

    // Random delay between 0 and 1 hour
    const randomDelay = Math.floor(Math.random() * 1000 * 60 * 60);
    this.logger.log(`Random delay: ${randomDelay} ms`);

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
