import { ListFilters } from '@wri-monorepos/geo';

export interface RequestPreSignedURLModel {
  key: string;
  contentType: string;
  replaceFile?: boolean;
}

export interface RequestSaveLargeListProcessModel {
  key: string;
  userId: number;
  list_id: number;
  listName: string;
  client_database: string;
}

export interface ResponsePreSignedURLModel {
  url: string;
  keyFile: string;
  fileS3Route: string;
}

export interface ResponseObjectPresignedURLModel {
  url: string;
}

export interface CreateListInsertResultModel {
  list_id: number;
  s3_location: string;
}

export interface RequestLargeListProcess {
  organization_id: number;
  list_id: number;
  path: string;
  template_type: string;
  user_id: number;
  startAnalysis: boolean;
  isExternalAPIProcess?: boolean;
}

export interface ResponseLargeListProcess {
  executionArn: string;
  startDate: string;
}

export interface RequestTriggerProcessLargeList {
  list_name: string;
  user_id: number;
  client_database: string;
  analysisIds: Array<string>;
}

export interface CopyOrMoveLargeListRequest {
  listId: number;
  selectedListLocationClasification: string;
  customAttributesNames: string[];
  userListNames: string[];
  action: string; // move or copy
  listType: string; // new or existing
  listName: string;
  targetList?: number;
  selectedLocations: number[];
  addType: string;
  activeTemplate: string;
  commodityType?: string;
  templateData: unknown;
  saveAsDraft: boolean;
  userId: number;
  clientDatabase: string;
  organizationId: number;
  subscriptionStatusId: number;
  gfwListId: number;
  allLocationsSelected: boolean;
  filters: ListFilters;
  srcListAnalysisTable: string;
}

export interface getPaginatedListDataRequest {
  listId: number;
  organizationDatabase: string;
  analysisAreaMax?: number;
  analysisAreaMin?: number;
  country?: string;
  geometry?: number;
  orderType?: string;
  page?: 0;
  rowsPerPage?: 1000;
  sortByAttribute?: string;
  state?: string;
  subState?: string;
  locationLogic?: string;
  locationIds?: string;
  locationStatement?: string;
  combinedColumns?: string;
  searchString?: string;
}

export interface getNumberOfPagesPaginatedListDataRequest {
  listId: number;
  organizationDatabase: string;
  subState?: string;
  rowsPerPage: 1000;
  analysisAreaMin?: number;
  analysisAreaMax?: number;
  searchString?: string;
}

export interface PaginatedQueryRequest {
  clientDatabase: string;
  rowsPerPage?: number;
  pageNumber?: number;
}

export interface GetAfiAnalysisDataRequest {
  clientDatabase: string;
  rowsPerPage?: number;
  pageNumber?: number;
  isListLevel: 0;
}

export interface DatabaseQueryParam {
  clientDatabase: string;
}
