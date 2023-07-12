export interface GenerationFileRequest {
  aggregation?: boolean;
  analysisArea?: number;
  analysisAreaMax?: number;
  analysisAreaMin?: number;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  combinedColumnsSplitted?: Array<string>;
  country?: string;
  fields?: Array<string>;
  file?: string;
  geometry?: number;
  key?: string;
  listID: number;
  listLevelAnalysis?: unknown;
  listName?: string;
  listView?: string;
  locationIds?: string;
  locationLogic?: string;
  locationStatement?: string;
  numberOfPages?: number;
  orderType?: string;
  organizationDatabase?: string;
  page?: number;
  rowsPerPage?: number;
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
  type?: string;
  userEmail?: string;
}

/*export interface GetAnalysisDataCountForUserListResponse {
  TotalRows: number;
}*/
