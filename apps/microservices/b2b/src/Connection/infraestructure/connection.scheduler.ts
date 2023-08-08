import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConnectionUseCases } from '../application/connection.use-case';

@Injectable()
export class ConnectionScheduler {
  private readonly logger = new Logger(ConnectionScheduler.name);

  constructor(private connectionUseCases: ConnectionUseCases) {}

  // This function run everyday at 4:00 AM
  @Cron('0 4 * * * *')
  async expireConnections() {
    this.logger.log('Starting to check and expired connections.');
    await this.connectionUseCases.expireConnections();
  }
}
