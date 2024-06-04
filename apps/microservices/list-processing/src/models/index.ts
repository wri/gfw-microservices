import { ApiProperty } from '@nestjs/swagger';
import { ListFilters } from '@wri-monorepos/geo';
import { optional } from 'zod'
export class GetObjectPresigned {
  @ApiProperty()
  key: string;
  @ApiProperty()
  replaceFile?: boolean;
}
export class RequestPreSignedURLModel extends GetObjectPresigned {
  @ApiProperty()
  contentType: string;
}

export class RequestSaveLargeListProcessModel {
  @ApiProperty()
  key: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  list_id: number;
  @ApiProperty()
  listName: string;
  @ApiProperty()
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

export class RequestLargeListProcess {
  @ApiProperty()
  organization_id: number;
  @ApiProperty()
  subscription_status_id: number;
  @ApiProperty()
  organization_database: string;
  @ApiProperty()
  list_id: number;
  @ApiProperty()
  path: string;
  @ApiProperty()
  template_type: string;
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  startAnalysis: boolean;
  @ApiProperty()
  isExternalAPIProcess?: boolean;
}

export interface ResponseLargeListProcess {
  executionArn: string;
  startDate: string;
}

export class RequestTriggerProcessLargeList {
  @ApiProperty()
  list_name: string;
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  client_database: string;
  @ApiProperty()
  analysisIds: Array<string>;
}

export class CreateListRequest {
  @ApiProperty()
  listName: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  clientDatabase: string;
  @ApiProperty()
  analysisIds: Array<string>;
  @ApiProperty()
  filename: string;
}

export class CopyOrMoveLargeListRequest {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  selectedListLocationClasification: string;
  @ApiProperty()
  customAttributesNames: string[];
  @ApiProperty()
  userListNames: string[];
  @ApiProperty()
  action: string; // move or copy
  @ApiProperty()
  listType: string; // new or existing
  @ApiProperty()
  listName: string;
  @ApiProperty({ required: false })
  targetList?: number;
  @ApiProperty()
  selectedLocations: number[];
  @ApiProperty()
  addType: string;
  @ApiProperty()
  activeTemplate: string;
  @ApiProperty()
  commodityType?: string;
  @ApiProperty()
  templateData: unknown;
  @ApiProperty()
  saveAsDraft: boolean;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  clientDatabase: string;
  @ApiProperty()
  organizationId: number;
  @ApiProperty()
  subscriptionStatusId: number;
  @ApiProperty()
  gfwListId: number;
  @ApiProperty()
  allLocationsSelected: boolean;
  @ApiProperty()
  filters: ListFilters;
  @ApiProperty()
  srcListAnalysisTable: string;
}

export class getPaginatedListDataRequest {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  organizationDatabase: string;
  @ApiProperty({ required: false })
  analysisAreaMax?: number;
  @ApiProperty()
  analysisAreaMin?: number;
  @ApiProperty({ required: false })
  country?: string;
  @ApiProperty({ required: false })
  geometry?: number;
  @ApiProperty({ required: false })
  orderType?: string;
  @ApiProperty({ required: false })
  page?: 0;
  @ApiProperty({ required: false })
  rowsPerPage?: 1000;
  @ApiProperty({ required: false })
  sortByAttribute?: string;
  @ApiProperty({ required: false })
  state?: string;
  @ApiProperty({ required: false })
  subState?: string;
  @ApiProperty({ required: false })
  locationLogic?: string;
  @ApiProperty({ required: false })
  locationIds?: string;
  @ApiProperty({ required: false })
  locationStatement?: string;
  @ApiProperty({ required: false })
  combinedColumns?: string;
  @ApiProperty({ required: false })
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

export interface DatabaseQueryParamCountryDeforestation extends DatabaseQueryParam {
  countryGadm: string;
  locationId?: number;
}

export interface FcdControllerRequestBody extends DatabaseQueryParam {
  clientDatabase: string;
  country?: string;
  countryGadm?: string;
  locationId?: number;
}

export class DeleteListRequest {
  @ApiProperty()
  organization_user_id: number;

  @ApiProperty()
  organizationDatabase: string;

  @ApiProperty()
  userEmail: string;
}
