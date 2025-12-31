import { ListsType } from '../queries';

export interface BasicFieldsFileRequest {
  file?: string;
  listId?: number;
  key?: string;
  page?: number;
  listName?: string;
  rowsPerPage?: number;
  userEmail?: string;
  type?: string;
  numberOfPages?: number;
  organizationDatabase?: string;
  isGFWList?: boolean;
  listView?: string;
  source?: 'listDetails' | 'landing' | 'dashboard' | 'diagnostics';
}

export interface ListFieldsFileRequest extends BasicFieldsFileRequest {
  aggregation?: boolean;
  analysisArea?: number;
  analysisAreaMax?: number;
  analysisAreaMin?: number;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  //TODO: Correct spelling: "combinedColumnsSplit"
  combinedColumnsSplitted?: Array<string>;
  country?: string;
  fields?: Array<string>;
  geometry?: number;
  listLevelAnalysis?: {
    country_area?: string;
    protected_areas_by_category_area?: string;
    landmark_by_category_area?: string;
    listId?: number;
    listName?: string;
    key?: string;
    type?: string;
    listView?: string;
    selectedLocationsList?: [];
  };
  listView?: string;
  locationIds?: string;
  locationLogic?: string;
  locationStatement?: string;
  orderType?: string;
  searchString?: string;
  selectedLocations?: string;
  selectedLocationsList?: Array<number>;
  selectedMillPriority?: string;
  selectedOverallThreats?: string;
  selectedOverallValues?: string;
  selectedParentCompany?: string;
  selectedSecondSupplier?: string;
  selectedSupplier?: string;
  showRSPOCertified?: boolean;
  sortByAttribute?: string;
  state?: string;
  subState?: string;
  templateId?: number;
}

export enum AlertsTimeframes {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export interface AlertFieldsFileRequest extends BasicFieldsFileRequest {
  selectedTimeframe: keyof typeof AlertsTimeframes;
  selectedAlert: string;
  startDate?: string;
  endDate?: string;
}

export interface AccountUsersUsageRequest extends BasicFieldsFileRequest {
  startDate?: string;
  endDate?: string;
}

// duplicate with libs/geo/src/utils/list.utils.ts for circular dependency
export type ListFilters = {
  country?: string;
  state?: string;
  subState?: string;
  analysisAreaMin?: number;
  analysisAreaMax?: number;
  searchString?: string;
};

export enum ActionType {
  Move = 'move',
  Copy = 'copy',
}

export enum TargetListType {
  New = 'new',
  Existing = 'existing',
}

export interface CopyOrMoveLargeListRequest {
  listId: number;
  selectedListLocationClassification: string;
  customAttributesNames: string[];
  userListNames: string[];
  action: ActionType;
  listType: TargetListType;
  listName: string;
  targetList?: ListsType;
  selectedLocations: number[];
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
