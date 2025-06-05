import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { ConverterManager, ConverterFunction } from './converter-manager';
import { ConverterStatus } from '@wri-monorepos/constants';
import { ConverterRepository } from './converter.repository';

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
   * @returns A list of client store database names.
   */
  async getClientStoreNames(organizationId?: number): Promise<string[]> {
    const gfwProConnection = await this.getGfwProConnection();
    return this.converterRepository.getClientStoresByOrgId(gfwProConnection, organizationId);
  }

  /**
   * Runs a converter for a given ID across one or more client stores (organizationDbs).
   * @param id The ID of the converter to run.
   * @param organizationDbs The list of organization database names to process.
   */
  async runConverter(id: number, organizationDbs: string[]): Promise<void> {
    this.errors = [];

    const { getConverterName, updateConverterStatus, updateConverterStartTime } =
      this.converterRepository;

    const gfwProConnection = await this.getGfwProConnection();
    await updateConverterStartTime(gfwProConnection, id);

    try {
      const converterName = await getConverterName(gfwProConnection, id);
      const converter = ConverterManager.get(converterName);
      if (!converter) {
        throw new Error(`Converter function for ${converterName} not found`);
      }

      await this.runConverterAcrossClientStores(organizationDbs, id, converter, converterName);

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
   * @param organizationDbs
   * @param converterId
   * @param converter
   * @param converterName
   */
  private async runConverterAcrossClientStores(
    organizationDbs: string[],
    converterId: number,
    converter: ConverterFunction,
    converterName: string
  ): Promise<void> {
    const { updateConverterStatus } = this.converterRepository;
    let failureCount = 0;

    for (const clientStore of organizationDbs) {
      try {
        await this.processListsInClientStore(clientStore, converterId, converter);
      } catch (error) {
        failureCount++;
        this.logger.error(
          `Error running converter ${converterName} for ${clientStore}: ${(
            error.stack || error
          ).toString()}`
        );
        this.errors.push({ clientStore, stack: error.stack || error.toString() });
      }

      if (failureCount >= this.MAX_FAILURES) {
        this.logger.warn(
          `Failure threshold exceeded (${this.MAX_FAILURES}), stopping further list processing for converter ${converterName}`
        );
        break;
      }
      await this.randomDelay(200, 700);
    }

    if (this.errors.length) {
      this.logger.error(`Converter ${converterName} encountered errors:`);
      for (const { clientStore, stack } of this.errors) {
        this.logger.error(`- ${clientStore}:\n${stack}`);
      }

      const combinedStacks = this.errors
        .map((e) => `Client: ${e.clientStore}\n${e.stack}`)
        .join('\n\n');

      await updateConverterStatus(
        await this.getGfwProConnection(),
        converterId,
        ConverterStatus.PARTIAL,
        combinedStacks
      );
    } else {
      await updateConverterStatus(
        await this.getGfwProConnection(),
        converterId,
        ConverterStatus.COMPLETED
      );
    }
  }

  /**
   * Calls the converter function on each client store.
   * @param clientStore The client store to process.
   * @param converterId The ID of the converter being run.
   * @param converter The converter function to execute.
   */
  private async processListsInClientStore(
    clientStore: string,
    converterId: number,
    converter: ConverterFunction
  ): Promise<void> {
    const { recordError, updateConverterStatus } = this.converterRepository;

    let failureCount = 0;
    const gfwProConnection = await this.getGfwProConnection();
    const clientStoreConnection = await this.clientStoreConnection.getConnection(clientStore);
    const listsRepository = clientStoreConnection.getRepository(Lists);

    this.logger.log(`Starting converter ${converter.run.name} for client store: ${clientStore}`);
    await this.updateConverterStartTime(converterId);

    this.logger.log(`Running converter ${converter.run.name} for client store: ${clientStore}`);
    await updateConverterStatus(gfwProConnection, converterId, ConverterStatus.RUNNING);

    const lists = await listsRepository.find({
      where: converter.where || {},
    });
    if (!lists.length) {
      this.logger.warn(`No lists found in client store ${clientStore}. Skipping.`);
      return;
    }
    this.logger.log(
      `Found ${lists.length} lists in client store ${clientStore}. Processing with converter ${converter.run.name}`
    );

    for (const list of lists) {
      try {
        await converter.run({
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

        if (failureCount >= this.MAX_FAILURES) {
          this.logger.warn(
            `Failure threshold exceeded (${this.MAX_FAILURES}), stopping further list processing for client store ${clientStore}`
          );
          break;
        }

        await this.randomDelay(200, 700); // Random delay between 200ms and 700ms
      }
    }
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
