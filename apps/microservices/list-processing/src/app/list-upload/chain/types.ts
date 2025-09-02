import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
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
  startAnalysis?: boolean;
  list_id?: number;
  analysisIds?: Array<string>;
  commodity?: string;
  isExternalAPIProcess: boolean;
  organization_id: number;
  subscription_status_id: number;

  hasUnanalyzableError: boolean;
  locations?: number[];
  listAttributesRecords?: Map<string, ListAttributesRecord>;
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
    await AbstractHandler.updateListsUploadStatus(
      result as ChainType,
      'Starting list upload process - ' + chain.constructor.name
    );
    while (nextJob) {
      const start = performance.now();
      try {
        result = await nextJob.handle(result);
      } catch (error) {
        const err: unknown = error;
        const { statusCode, stack, message } = AbstractHandler.parseError(err);

        if (statusCode && statusCode >= 400 && statusCode <= 499) {
          Logger.error(
            `Client error (${statusCode}) in ${nextJob.constructor.name}: ${stack || message}`
          );
          throw error;
        }
        Logger.error(`Error in ${nextJob.constructor.name}: ${stack || message}`);
        await AbstractHandler.updateListsUploadStatus(
          result as ChainType,
          `Error in ${nextJob.constructor.name}`,
          message
        );
        const chainInput = (result as ChainType).request as RequestNewList;
        chainInput.hasUnanalyzableError = true;
        const geoJsonOut = (result as ChainType).geojson as FeatureCollection;
        const fakeErrFeature = {
          properties: { errorDetails: message },
          geometry: {} as unknown,
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
    await AbstractHandler.updateListsUploadStatus(
      result as ChainType,
      'Ending list upload process - ' + chain.constructor.name
    );
    return result;
  }

  static parseError(err: unknown): { statusCode?: number; stack?: string; message: string } {
    const statusCode =
      typeof err === 'object' &&
      err !== null &&
      'getStatus' in err &&
      typeof (err as { getStatus?: () => number }).getStatus === 'function'
        ? (err as { getStatus: () => number }).getStatus()
        : typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status?: number }).status
        : undefined;

    const stack =
      typeof err === 'object' && err !== null && 'stack' in err
        ? (err as { stack?: string }).stack
        : undefined;

    const message =
      typeof err === 'object' && err !== null && 'message' in err
        ? (err as { message?: string }).message || 'Unknown error'
        : String(err);

    return { statusCode, stack, message };
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
