import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { clearTimeout } from 'timers';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { formatDurationStr, formatHeapUsed } from '../shared/performance.utils';

export type AttributeType = {
  [x: string]: string;
};

export type ChainType = {
  geojson?: FeatureCollection;
  request: RequestNewList | PreviewListRequest;
};

export interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}

export interface PreviewListRequest {
  path: string;
  preview?: boolean;
  fileDownloadedPath?: string;
}

export interface RequestNewList extends PreviewListRequest {
  list_name?: string;
  organization_database: string;
  listTable?: string;
  analysisTable?: string;
  saveAsDraft?: boolean;
  locationClassification?: string;
  customAttributeNames?: string;
  customAttributeTypes?: string;
  gfwListId?: number;
  user_id?: number;
  template_id?: number;
  template_type?: string;
  startAnalysis?: boolean;
  list_id?: number;
  analysisIds?: Array<string>;
  commodity?: string;
  isExternalAPIProcess: boolean;
  organization_id: number;
  subscription_status_id: number;

  hasUnanalyzableError: boolean;
  locations?: number[];
}

interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): Promise<T> | T;
}

export abstract class AbstractHandler<T> implements Handler<T> {
  private nextHandler: AbstractHandler<T>;
  public setNext(handler: AbstractHandler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(request: T): Promise<T> {
    if (this.nextHandler) {
      return await this.nextHandler.handle(request);
    }

    return request;
  }

  static async runFullChain<T>(chain: AbstractHandler<T>, chainType: T): Promise<T> {
    let nextJob = chain;
    let result: T = chainType;
    let stepCount = 0;

    await AbstractHandler.updateListsUploadStatus(
      result as ChainType,
      'Starting list upload process'
    );

    while (nextJob) {
      stepCount++;
      const handlerName = nextJob.constructor.name;
      const start = performance.now();

      Logger.log(`[Chain Step ${stepCount}] Starting handler: ${handlerName}`);

      try {
        // Add individual timeout for problematic handlers
        const HANDLER_TIMEOUTS = {
          DownloadS3File: 10 * 60 * 1000, // 10 minutes
          ClipToLandService: 10 * 60 * 1000, // 10 minutes
          ProcessUploadData: 15 * 60 * 1000, // 15 minutes
          GADMService: 8 * 60 * 1000, // 8 minutes
          InsertLocationData: 10 * 60 * 1000, // 10 minutes
          CreateLocationSchema: 12 * 60 * 1000, // 12 minutes (database heavy)
          CreateListLevelData: 8 * 60 * 1000, // 8 minutes
        };

        const timeout = HANDLER_TIMEOUTS[handlerName] || 5 * 60 * 1000; // Default 5 minutes

        let timeoutId: NodeJS.Timeout;
        let handlerCompleted = false;

        const handlerPromise = nextJob.handle(result);
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            if (!handlerCompleted) {
              handlerCompleted = true;
              reject(
                new Error(`Handler ${handlerName} timeout after ${timeout / 1000 / 60} minutes`)
              );
            }
          }, timeout);
        });

        try {
          result = (await Promise.race([handlerPromise, timeoutPromise])) as T;
          handlerCompleted = true;
          clearTimeout(timeoutId);
        } catch (error) {
          handlerCompleted = true;
          clearTimeout(timeoutId);
          throw error;
        }

        const end = performance.now();
        const duration = Math.round(end - start);
        Logger.log(`[Chain Step ${stepCount}] Completed handler: ${handlerName} in ${duration}ms`);
      } catch (error) {
        const end = performance.now();
        const duration = Math.round(end - start);

        Logger.error(
          `[Chain Step ${stepCount}] Error in ${handlerName} after ${duration}ms: ${
            error.stack || error.message || error
          }`
        );

        await AbstractHandler.updateListsUploadStatus(
          result as ChainType,
          `Error in ${handlerName}`,
          error.message
        );

        const chainInput = (result as ChainType).request as RequestNewList;
        chainInput.hasUnanalyzableError = true;
        const geoJsonOut = (result as ChainType).geojson as FeatureCollection;
        const fakeErrFeature = {
          properties: { errorDetails: error.message },
          geometry: {} as any,
          type: 'Feature',
        };
        geoJsonOut.features.push(fakeErrFeature as Feature);
        if (chainInput.preview) {
          break;
        }
      }

      const end = performance.now();
      const { heapUsed } = process.memoryUsage();
      AbstractHandler.logExecutionTime(start, end, heapUsed, nextJob.constructor.name);
      nextJob = nextJob.nextHandler;
    }

    Logger.log(`[Chain] Completed all ${stepCount} steps successfully`);
    await AbstractHandler.updateListsUploadStatus(
      result as ChainType,
      'Ending list upload process'
    );
    return result;
  }

  static logExecutionTime(start, end, heapUsed, className) {
    const logger = new Logger(className);
    const durationStr = formatDurationStr(start, end);
    const memoryUsed = formatHeapUsed(heapUsed);

    logger.debug(`Execution Time: ${durationStr}\tMemory Used: ${memoryUsed}`);
  }

  static async updateListsUploadStatus(result: ChainType, message: string, errorInfo?: string) {
    const { list_id: listId, organization_database } = result.request as RequestNewList;

    if (listId) {
      await updateListsUploadStatus(organization_database, listId, message, errorInfo);
    }
  }
}
