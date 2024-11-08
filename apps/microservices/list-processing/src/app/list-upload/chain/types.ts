import { FeatureCollection } from '@wri-monorepos/geo';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';

export type ChainType = {
  geojson?: FeatureCollection;
  request: RequestNewList | PreviewListRequest;
};

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
  listStatusId?: number;
  locationClassification?: string;
  customAttributeNames?: string;
  customAttributeTypes?: string;
  gfwListId?: number;
  user_id?: number;
  template_id?: number;
  listId?: number;
  analysisIds?: Array<string>;

  isExternalAPIProcess: boolean;
  organization_id: number;
  subscription_status_id: number;
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
    while (nextJob) {
      const start = performance.now();
      try {
        result = await nextJob.handle(result);
      } catch (error) {
        Logger.error(`Error in ${nextJob.constructor.name}: ${error.message}`);
      }
      const end = performance.now();
      AbstractHandler.logExecutionTime(start, end, nextJob.constructor.name);
      nextJob = nextJob.nextHandler;
    }
    return result;
  }

  static logExecutionTime(start, end, className) {
    const logger = new Logger(className);
    const durationMs = end - start;
    let durationStr;
    if (durationMs < 1000) {
      durationStr = `${durationMs.toFixed(2)}ms`;
    } else if (durationMs < 60000) {
      const durationSec = durationMs / 1000;
      durationStr = `${durationSec.toFixed(2)}s`;
    } else {
      const durationMin = durationMs / 60000;
      durationStr = `${durationMin.toFixed(2)}min`;
    }

    logger.debug(`${className} executed in ${durationStr}`);
  }
}
