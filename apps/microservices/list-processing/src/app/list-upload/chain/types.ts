import { FeatureCollection } from '@wri-monorepos/geo';

export type ChainType = {
  geojson?: FeatureCollection;
  errorGeojson?: FeatureCollection;
  request: RequestNewList;
};

export type RequestNewList = {
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
  path: string;
  listId?: number;
  analysisIds?: Array<string>;
  fileDownloadedPath?: string;
};

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
