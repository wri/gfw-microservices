import { FeatureCollection } from '@wri-monorepos/geo';

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
}

interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): Promise<T>;
}

export abstract class AbstractHandler<T> implements Handler<T> {
  private nextHandler: Handler<T>;
  public setNext(handler: Handler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler;
  }
  public async handle(request: T): Promise<T> {
    if (this.nextHandler) {
      return await this.nextHandler.handle(request);
    }
    return request;
  }
}
