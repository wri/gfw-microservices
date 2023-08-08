import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConnectionUseCases } from '../application/connection.use-case';

@Injectable()
export class ConnectionScheduler {
  private readonly logger = new Logger(ConnectionScheduler.name);

  constructor(private connectionUseCases: ConnectionUseCases) {}

  // This function run every hour
  @Cron('0 0 * * * *')
  async expireConnections() {
    this.logger.log('Starting to check and expired connections.');
    await this.connectionUseCases.expireConnections();
  }
}
