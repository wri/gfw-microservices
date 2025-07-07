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

@Injectable()
export class ConvertersService {
  private readonly logger = new Logger('List processing service');
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
    organizationId?: number
  ): Promise<{ id: number; organizationDb: string }[]> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.getClientStoresByOrgId(gfwProConnection, organizationId);
  }

  /**
   * Runs a converter for a given ID across one or more client stores (organizationDbs).
   * @param id The ID of the converter job being run.
   * @param organizationId The ID of the organization to filter by (optional).
   */
  async runConverter(id: number, organizationId?: number): Promise<void> {
    this.errors = [];

    const { getConverterName, updateConverterStatus, updateConverterStartTime } =
      this.converterRepository;

    const gfwProConnection = await this.getGfwProConnection();
    await updateConverterStartTime(gfwProConnection, id);

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

      await this.runConverterAcrossClientStores(converterContext, organizationId);

      const status = this.errors.length > 0 ? ConverterStatus.PARTIAL : ConverterStatus.COMPLETED;
      this.logger.log(`Converter ${converterName} finished with status: ${status}`);
      await updateConverterStatus(gfwProConnection, id, status);
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
    organizationId?: number
  ): Promise<void> {
    const { updateConverterStatus } = this.converterRepository;
    let failureCount = 0;
    const clientStoresInfo: ClientStoreInfo[] = await this.getClientStoreInfo(organizationId);

    for (const clientStoreInfo of clientStoresInfo) {
      try {
        await this.processListsInClientStore(clientStoreInfo, converterContext);
      } catch (error) {
        failureCount++;
        this.logger.error(
          `Error running converter ${converterContext.name} for ${
            clientStoreInfo.organizationDb
          }: ${(error.stack || error).toString()}`
        );
        this.errors.push({
          clientStore: clientStoreInfo.organizationDb,
          stack: error.stack || error.toString(),
        });

        if (failureCount >= this.MAX_FAILURES) {
          this.logger.warn(
            `Failure threshold exceeded (${this.MAX_FAILURES}), stopping further list processing for converter ${converterContext.name}`
          );
          break;
        }
      }

      await this.randomDelay(200, 700);
    }

    const status =
      this.errors.length === clientStoresInfo.length
        ? ConverterStatus.FAILED
        : this.errors.length > 0
        ? ConverterStatus.PARTIAL
        : ConverterStatus.COMPLETED;

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
    converterContext: ConverterContext
  ): Promise<boolean> {
    const gfwProConnection = await this.getGfwProConnection();
    const { id: converterId, function: converterFunction } = converterContext;

    const clientStoreConnection = await this.clientStoreConnection.getConnection(
      clientStore.organizationDb
    );
    const listsRepository = clientStoreConnection.getRepository(Lists);
    const { updateConverterStatus } = this.converterRepository;

    this.logger.log(
      `Starting converter ${converterFunction.run.name} for client store: ${clientStore.organizationDb}`
    );
    await this.updateConverterStartTime(converterId);
    await updateConverterStatus(gfwProConnection, converterId, ConverterStatus.RUNNING);

    const lists = await this.fetchListsToConvert(
      listsRepository,
      converterFunction.where,
      clientStore.organizationDb
    );
    if (!lists.length) {
      return;
    }

    await this.convertLists(lists, converterContext, clientStore);
  }

  private async convertLists(
    lists: Lists[],
    converterContext: ConverterContext,
    clientStore: ClientStoreInfo
  ): Promise<void> {
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
        });

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

        if (failureCount >= this.MAX_FAILURES) {
          this.logger.warn(
            `Failure threshold exceeded (${this.MAX_FAILURES}). Stopping list processing.`
          );
          break;
        }
      }
    }
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
