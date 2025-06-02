import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// import { AlertsRepository } from './alerts.repository';
import { ClientStoreConnection, ActivityLog } from '@wri-monorepos/sql';
import { ServerConfigType } from '../../validators/server-config';
import { ConverterManager } from './converterManager';

@Injectable()
export class ConvertersService {
  // TODO: DELETE:
  // constructor(private readonly alertsRepository: AlertsRepository) {}
  private readonly logger = new Logger('List processing service');
  private readonly s3Client: S3Client;

  constructor(
    private dataSource: DataSource,
    private readonly clientStoreConnection: ClientStoreConnection,
    protected readonly config: ConfigService<ServerConfigType, true>
  ) {
    this.s3Client = new S3Client({ region: this.config.get('AWS_REGION', { infer: true }) });
  }

  async getClientStoresByOrgId(organizationId?: number): Promise<string[]> {
    let query = 'SELECT organization_db FROM Organizations';
    const params: any[] = [];

    if (organizationId) {
      query += ' WHERE id = ?';
      params.push(organizationId);
    }

    const results = await this.dataSource.query(query, params);

    if (!results.length) {
      throw new NotFoundException(
        organizationId
          ? `Organization with ID: '${organizationId}' not found.`
          : 'No active client stores found.'
      );
    }

    return results.map((row) => row.organization_db);
  }

  async runConverterForClientStores(id: number, organizationDbs: string[]): Promise<void> {
    const gfwProConnection = await this.clientStoreConnection.getConnection('gfwpro');
    const converterStatusResult = await gfwProConnection.query(`
      SELECT [name]
      FROM [ConverterStatus]
      WHERE [id] = ${id}
    `);

    if (!converterStatusResult.length) {
      throw new Error(`No ConverterStatus found with ID ${id}`);
    }

    const converterName = converterStatusResult[0].name;
    const converterFn = ConverterManager.get(converterName);
    const randomDelay = Math.random() * 1000 + 500;

    for (const clientStore of organizationDbs) {
      try {
        const connection = await this.clientStoreConnection.getConnection(clientStore);
        const activityLogRepository = connection.getRepository(ActivityLog);

        const activityLog = new ActivityLog();
        // TODO: Can we save activityLog without a userId?
        // activityLog.userId = ;
        activityLog.activityTypeId = 42;
        activityLog.activityDescription = `User started converter ID: ${id}, on ${clientStore}`;
        activityLog.activityTime = new Date();
        await activityLogRepository.save(activityLog);

        // TODO: Call actual converter logic here
        converterFn();
      } catch (error) {
        // Log which org failed
        console.error(`Error processing client store ${clientStore}:`, error);
        // TODO: add a failed ConverterStatus here
      }

      await new Promise((resolve) => setTimeout(resolve, randomDelay));
    }
  }

  async updateConverterStatus(converterId: number, status: 'OK' | 'ERROR'): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('ConverterStatus')
      .set({ status })
      .where('id = :id', { id: converterId })
      .execute();
  }

  async updateConverterStartTime(converterId: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('ConverterStatus')
      .set({ start_time: new Date() })
      .where('id = :id', { id: converterId })
      .execute();
  }
}
