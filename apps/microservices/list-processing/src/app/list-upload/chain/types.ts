import { GeoJson } from '@wri-monorepos/geo';

export type ChainType = {
  geojson: GeoJson;
  request: RequestNewList;
};

export type RequestNewList = {
  list_name: string;
  organization_database: string;
  listTable?: string;
  analysisTable?: string;
  listStatusId?: number;
  locationClassification?: string;
  customAttributeNames?: string;
  customAttributeTypes?: string;
  gfwListId?: number;
  userId: number;
  templateId: number;
  path: string;
  listId?: number;
  analysisIds?: Array<string>;
};

interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): Promise<void>;
}

export abstract class AbstractHandler<T> implements Handler<T> {
  private nextHandler: Handler<T>;
  public setNext(handler: Handler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler;
  }
  public async handle(request: T): Promise<void> {
    if (this.nextHandler) {
      return await this.nextHandler.handle(request);
    }
    return null;
  }
}
