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
}

export interface ListFieldsFileRequest extends BasicFieldsFileRequest {
  aggregation?: boolean;
  analysisArea?: number;
  analysisAreaMax?: number;
  analysisAreaMin?: number;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  combinedColumnsSplitted?: Array<string>;
  country?: string;
  fields?: Array<string>;
  geometry?: number;
  listLevelAnalysis?: unknown;
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

export interface AlertFieldsFileRequest extends BasicFieldsFileRequest {
  selectedTimeframe: string;
  selectedAlert: string;
  startDate?: string;
  endDate?: string;
}

export interface AccountUsersUsageRequest extends BasicFieldsFileRequest {
  startDate?: string;
  endDate?: string;
}
