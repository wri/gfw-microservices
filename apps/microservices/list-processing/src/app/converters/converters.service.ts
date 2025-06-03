import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ClientStoreConnection, ActivityLog, Lists } from '@wri-monorepos/sql';
import { ConverterManager, ConverterFunction } from './converter-manager';
import { ConverterStatus } from '@wri-monorepos/constants';
import { ConverterRepository } from './converter.repository';

@Injectable()
export class ConvertersService {
  private readonly logger = new Logger('List processing service');
  private hasErrors = false;
  private gfwProConnection?: DataSource; // Cached singleton

  constructor(
    private readonly converterRepository: ConverterRepository,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {}

  /**
   * Retrieves the GFW Pro connection, caching it for future use as Singleton.
   */
  private async getGfwProConnection(): Promise<DataSource> {
    if (!this.gfwProConnection) {
      try {
        this.gfwProConnection = await this.clientStoreConnection.getConnection('gfwpro');
      } catch (error) {
        this.logger.error(`Failed to get gfwpro connection: ${error.message}`);
        throw new Error('Could not establish gfwpro connection');
      }
    }
    return this.gfwProConnection;
  }

  /**
   * Retrieves one or more client stores associated with a given organization ID.
   * @param organizationId The ID of the organization to filter by (optional).
   * @returns A list of client store database names.
   */
  async getClientStoresByOrgId(organizationId?: number): Promise<string[]> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.getClientStoresByOrgId(gfwProConnection, organizationId);
  }

  /**
   * Runs a converter for a given ID across one or more client stores (organizationDbs).
   * @param id The ID of the converter to run.
   * @param organizationDbs The list of organization database names to process.
   */
  async runConverter(id: number, organizationDbs: string[]): Promise<void> {
    const { getConverterName, updateConverterStatus, updateConverterStartTime } =
      this.converterRepository;
    this.hasErrors = false;

    const gfwProConnection = await this.getGfwProConnection();
    await updateConverterStartTime(gfwProConnection, id);

    try {
      const converterName = await getConverterName(gfwProConnection, id);
      const converterFn = ConverterManager.get(converterName);
      if (!converterFn) {
        throw new Error(`Converter function for ${converterName} not found`);
      }

      await this.runConverterAcrossClientStores(organizationDbs, id, converterFn, converterName);

      const status = this.hasErrors ? ConverterStatus.PARTIAL : ConverterStatus.COMPLETED;
      await updateConverterStatus(gfwProConnection, id, status);
    } catch (error) {
      await updateConverterStatus(gfwProConnection, id, ConverterStatus.FAILED);
      this.logger.error(`Converter job failed completely: ${error.message}`);
      throw error;
    }
  }

  /**
   * Asynchronously runs a converter function for 1 or more clientStores (organizationDbs).
   * It handles errors for each store individually, continuing processing even if issues arise
   * @param organizationDbs
   * @param converterId
   * @param converterFn
   * @param converterName
   */
  private async runConverterAcrossClientStores(
    organizationDbs: string[],
    converterId: number,
    converterFn: ConverterFunction,
    converterName: string
  ): Promise<void> {
    for (const clientStore of organizationDbs) {
      try {
        await this.processListsInClientStore(clientStore, converterId, converterFn);
      } catch (error) {
        this.logger.error(
          `Error running converter ${converterName} client store ${clientStore}: ${error.message}`
        );
        this.hasErrors = true;
      }

      const delay = Math.random() * 1000 + 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (this.hasErrors) {
      this.logger.error(`Converter ${converterName} encountered some errors during processing.`);
    }
  }

  /**
   * Calls the converter function on each client store.
   * @param clientStore The client store to process.
   * @param converterId The ID of the converter being run.
   * @param converterFn The converter function to execute.
   */
  private async processListsInClientStore(
    clientStore: string,
    converterId: number,
    converterFn: ConverterFunction
  ): Promise<void> {
    const { recordError, updateConverterStatus } = this.converterRepository;

    const MAX_FAILURES = 5;
    let failureCount = 0;
    const gfwProConnection = await this.getGfwProConnection();
    const clientStoreConnection = await this.clientStoreConnection.getConnection(clientStore);
    const activityLogRepository = gfwProConnection.getRepository(ActivityLog);

    const listsRepository = clientStoreConnection.getRepository(Lists);

    await this.logActivityStart(activityLogRepository, converterId, clientStore);

    this.logger.log(`Starting converter ${converterFn.name} for client store: ${clientStore}`);
    await this.updateConverterStartTime(converterId);
    this.logger.log(`Running converter ${converterFn.name} for client store: ${clientStore}`);
    await updateConverterStatus(gfwProConnection, converterId, ConverterStatus.RUNNING);

    const lists = await listsRepository.find();
    if (!lists.length) {
      this.logger.warn(`No lists found in client store ${clientStore}. Skipping.`);
      return;
    }
    this.logger.log(
      `Found ${lists.length} lists in client store ${clientStore}. Processing with converter ${converterFn.name}`
    );

    for (const list of lists) {
      try {
        await converterFn({
          clientDb: clientStore,
          listId: list.id,
          userId: null /* TODO: we might need to send this to LP endpoint */,
        });
      } catch (error) {
        failureCount++;
        this.logger.error(
          `Error processing list ${list.id} in client store ${clientStore}: ${error.message}`
        );
        await recordError(
          gfwProConnection,
          converterId,
          `Error on list ${list.id}: ${error.message}`,
          clientStore,
          list.id
        );

        if (failureCount >= MAX_FAILURES) {
          this.logger.warn(
            `Failure threshold exceeded (${MAX_FAILURES}), stopping further list processing for client store ${clientStore}`
          );
          break;
        }
      }
    }
  }

  async updateConverterStartTime(converterId: number): Promise<void> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.updateConverterStartTime(gfwProConnection, converterId);
  }

  // Helper methods

  /**
   * Logs the start of an activity.
   * @param activityLogRepository The repository to log the activity.
   * @param converterId The ID of the converter being started.
   * @param clientStore The client store where the activity is logged.
   */
  private async logActivityStart(
    activityLogRepository: any,
    converterId: number,
    clientStore: string
  ): Promise<void> {
    const activityLog = new ActivityLog();
    activityLog.activityTypeId = 42;
    activityLog.activityDescription = `User started converter ID: ${converterId}, on ${clientStore}`;
    activityLog.activityTime = new Date();
    await activityLogRepository.save(activityLog);
  }
}
