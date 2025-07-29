import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { ConverterManager, ConverterFunction } from './converter-manager';
import { ConverterStatus } from '@wri-monorepos/constants';
import { ConverterRepository } from './converter.repository';

interface ClientStoreInfo {
  id: number;
  organizationDb: string;
}

interface ConverterContext {
  id: number;
  name: string;
  function: ConverterFunction;
}

interface ConverterRunOptions {
  isContinueMode: boolean;
  organizationId?: number;
  isDryRun?: boolean; // Optional, used for testing or dry runs
}

@Injectable()
export class ConvertersService {
  private readonly logger = new Logger(`List Processing: ${ConvertersService.name}`);
  private errors: { clientStore: string; stack: string }[] = [];
  private gfwProConnection?: DataSource; // Cached singleton
  private MAX_FAILURES = 5; // Maximum failures before stopping processing

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
   * @returns A list of client store database names and ids.
   */
  async getClientStoreInfo(
    options: ConverterRunOptions
  ): Promise<{ id: number; organizationDb: string }[]> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.getClientStoresByOrgId(gfwProConnection, options);
  }

  /**
   * Runs a converter for a given ID across one or more client stores (organizationDbs).
   * @param id The ID of the converter job being run.
   * @param organizationId The ID of the organization to filter by (optional).
   */
  async runConverter(id: number, converterRunOptions: ConverterRunOptions): Promise<void> {
    this.errors = [];
    const { getConverterName, updateConverterStartTime, updateConverterStatus } =
      this.converterRepository;
    const gfwProConnection = await this.getGfwProConnection();

    try {
      await updateConverterStatus(gfwProConnection, id, ConverterStatus.RUNNING);
      await updateConverterStartTime(gfwProConnection, id);
    } catch (error) {
      const errorMessage = error?.response?.data || error?.message || error || 'Unknown error';
      const errorLog = `Failed to update converter start time for ID: ${id}: ${
        typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      }`;
      this.logger.error(errorLog);
      throw error;
    }

    try {
      const converterName = await getConverterName(gfwProConnection, id);
      const converterFunction = ConverterManager.get(converterName);

      if (!converterFunction) {
        throw new Error(`Converter function for ${converterName} not found`);
      }

      const converterContext: ConverterContext = {
        id,
        name: converterName,
        function: converterFunction,
      };

      this.logger.log(
        `Converter '${converterFunction.run.name}' run requested, ID ${id}, Continue Mode: ${converterRunOptions.isContinueMode}, Organization ID: ${converterRunOptions.organizationId}`
      );

      await this.runConverterAcrossClientStores(converterContext, converterRunOptions);
      this.logger.log(`Converter ${converterName} finished`);
    } catch (error) {
      await updateConverterStatus(
        gfwProConnection,
        id,
        ConverterStatus.FAILED,
        error.stack || error.toString()
      );
      this.logger.error(`Converter job failed completely: ${(error.stack || error).toString()}`);
      throw error;
    }
  }

  /**
   * Asynchronously runs a converter function for 1 or more clientStores (organizationDbs).
   * It handles errors for each store individually, continuing processing even if issues arise
   * @param converterContext
   * @param organizationId
   */
  private async runConverterAcrossClientStores(
    converterContext: ConverterContext,
    converterRunOptions: ConverterRunOptions
  ): Promise<void> {
    const { updateConverterStatus } = this.converterRepository;
    const gfwProConnection = await this.getGfwProConnection();
    const { id: converterId } = converterContext;
    const { isDryRun } = converterRunOptions;

    let clientStoreFailureCount = 0;
    const clientStores: ClientStoreInfo[] = await this.getClientStoreInfo(converterRunOptions);

    let totalLists = 0;
    let failedLists = 0;
    let isStopped = false;

    for (const clientStoreInfo of clientStores) {
      try {
        const { successCount, failureCount } = await this.processListsInClientStore(
          clientStoreInfo,
          converterContext,
          isDryRun
        );

        totalLists += successCount + failureCount;
        failedLists += failureCount;

        isStopped = await this.converterRepository.isConverterStopped(
          gfwProConnection,
          converterId
        );
        if (isStopped) {
          this.logger.warn(`Converter ${converterId} was manually stopped. Halting.`);
          return;
        }
      } catch (error) {
        clientStoreFailureCount++;

        /**
         * We're not counting precisely how many failed if the full store fails
         * since we only need the total vs failed lists to determine status.
         */
        failedLists += 1;
        totalLists += 1;

        this.errors.push({
          clientStore: clientStoreInfo.organizationDb,
          stack: error.stack || error.toString(),
        });

        this.logger.error(
          `Error running converter ${converterContext.name} for ${
            clientStoreInfo.organizationDb
          }: ${(error.stack || error).toString()}`
        );

        if (clientStoreFailureCount >= this.MAX_FAILURES) {
          this.logger.warn(
            `Failure threshold exceeded (${this.MAX_FAILURES}), stopping further list processing for converter ${converterContext.name}`
          );
          break;
        }
      }

      await this.randomDelay(200, 700);
    }

    let status: ConverterStatus;

    if (totalLists === 0 || failedLists === 0) {
      // No lists to process or all succeeded
      status = ConverterStatus.COMPLETED;
    } else if (failedLists === totalLists) {
      status = ConverterStatus.FAILED;
    } else {
      // Some lists failed but some succeeded
      status = ConverterStatus.PARTIAL;
    }

    await updateConverterStatus(
      await this.getGfwProConnection(),
      converterContext.id,
      status,
      this.errors.length > 0
        ? this.errors.map((e) => `Client: ${e.clientStore}\n${e.stack}`).join('\n\n')
        : undefined
    );
  }

  /**
   * Calls the converter function on each client store.
   * @param clientStore The client store to process.
   * @param converterContext The context containing converter ID, name, and function.
   */
  private async processListsInClientStore(
    clientStore: ClientStoreInfo,
    converterContext: ConverterContext,
    isDryRun = false
  ): Promise<{ successCount: number; failureCount: number }> {
    const { function: converterFunction } = converterContext;

    const clientStoreConnection = await this.clientStoreConnection.getConnection(
      clientStore.organizationDb
    );
    const listsRepository = clientStoreConnection.getRepository(Lists);

    this.logger.log(
      `Starting converter '${converterFunction.run.name}' for client store: ${clientStore.organizationDb}`
    );

    const lists = await this.fetchListsToConvert(
      listsRepository,
      converterFunction.where,
      clientStore.organizationDb
    );
    if (!lists.length) {
      return { successCount: 0, failureCount: 0 };
    }

    const { successCount, failureCount } = await this.convertLists(
      lists,
      converterContext,
      clientStore,
      isDryRun
    );

    return { successCount, failureCount };
  }

  private async convertLists(
    lists: Lists[],
    converterContext: ConverterContext,
    clientStore: ClientStoreInfo,
    isDryRun
  ): Promise<{ successCount: number; failureCount: number }> {
    let successCount = 0;
    let failureCount = 0;
    const { id: clientStoreId, organizationDb } = clientStore;
    const { id: converterId, name: converterName, function: converterFunction } = converterContext;
    const gfwProConnection = await this.getGfwProConnection();

    for (const list of lists) {
      try {
        this.logger.log(`Processing list ${list.id} in client store ${organizationDb}`);
        await converterFunction.run({
          clientDb: organizationDb,
          listId: list.id,
          userId: null,
          isDryRun, // Pass isDryRun to the converter function
        });

        successCount++;

        await this.randomDelay(200, 700);

        const isStopped = await this.converterRepository.isConverterStopped(
          gfwProConnection,
          converterId
        );
        if (isStopped) {
          this.logger.warn(`Converter ${converterId} was manually stopped. Halting.`);
          break;
        }
      } catch (error) {
        failureCount++;
        this.logger.error(
          `Error processing list ${list.id} in client store ${organizationDb}: ${error.message}`
        );

        await this.converterRepository.recordError(
          converterName,
          gfwProConnection,
          converterId,
          error.message,
          clientStoreId,
          list.id
        );

        this.errors.push({ clientStore: organizationDb, stack: error.stack || error.toString() });
      }
    }

    this.logger.log(
      `Finished processing ${lists.length} lists in client store ${organizationDb}. Successes: ${successCount}, Failures: ${failureCount}`
    );

    return { successCount, failureCount };
  }

  private async fetchListsToConvert(
    repo: Repository<Lists>,
    whereClause: object | undefined,
    clientStore: string
  ): Promise<Lists[]> {
    const lists = await repo.find({ where: whereClause || {} });
    if (!lists.length) {
      this.logger.warn(`No lists found in client store ${clientStore}. Skipping.`);
    } else {
      this.logger.log(
        `Found ${lists.length} lists in client store ${clientStore}. Beginning processing.`
      );
    }
    return lists;
  }

  async updateConverterStartTime(converterId: number): Promise<void> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.updateConverterStartTime(gfwProConnection, converterId);
  }

  private async randomDelay(min, max) {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
