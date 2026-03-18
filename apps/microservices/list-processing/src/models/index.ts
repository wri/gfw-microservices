import { ApiProperty } from '@nestjs/swagger';
import { ListFilters } from '@wri-monorepos/geo';
import { ActionType, ListsType, TargetListType } from '@wri-monorepos/sql';
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
  list_id?: number;
  @ApiProperty()
  path: string;
  @ApiProperty()
  user_id?: number;
  @ApiProperty()
  startAnalysis: boolean;
  @ApiProperty()
  isExternalAPIProcess?: boolean;

  @ApiProperty()
  list_name?: string;

  @ApiProperty()
  analysisIds?: Array<string>;

  @ApiProperty()
  saveAsDraft: false;
  @ApiProperty()
  commodity: string;
  @ApiProperty({ required: false })
  options?: string;
}

export class StartAnalysisType {
  @ApiProperty()
  organization_id: number;
  @ApiProperty()
  subscription_status_id: number;
  @ApiProperty()
  organization_database: string;
  @ApiProperty()
  path: string;
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
  @ApiProperty()
  organization_id: number;
  @ApiProperty()
  commodity?: string;
  @ApiProperty()
  saveAsDraft: boolean;
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

  @ApiProperty()
  organization_id: number;

  @ApiProperty()
  saveAsDraft: boolean;
}

export class CopyOrMoveLargeListRequestLLP {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  selectedListLocationClassification: string;
  @ApiProperty()
  customAttributesNames: string[];
  @ApiProperty()
  userListNames: string[];
  @ApiProperty()
  action: ActionType; // move or copy
  @ApiProperty()
  listName: string;
  @ApiProperty()
  listType: TargetListType;
  @ApiProperty({ required: false })
  targetList?: ListsType;
  @ApiProperty({ example: [1, 2, 3] })
  selectedLocations: number[];
  @ApiProperty()
  commodityType?: string;
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
  page?: number;
  @ApiProperty({ required: false })
  rowsPerPage?: number;
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

export class getNumberOfPagesPaginatedListDataRequest {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  organizationDatabase: string;
  @ApiProperty({ required: false })
  subState?: string;
  @ApiProperty()
  rowsPerPage: number;
  @ApiProperty({ required: false })
  analysisAreaMin?: number;
  @ApiProperty({ required: false })
  analysisAreaMax?: number;
  @ApiProperty({ required: false })
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
export interface GetGHGAnalysisDataRequest {
  clientDatabase: string;
  rowsPerPage?: number;
  pageNumber?: number;
}
