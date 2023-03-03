export interface GenerationFileRequest {
  analysisArea?: number;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  combinedColumnsSplitted?: Array<string>;
  country?: string;
  file?: string;
  geometry?: number;
  key?: string;
  listID: number;
  listName?: string;
  orderType?: string;
  organizationDatabase?: string;
  page?: number;
  numberOfPages?: number;
  rowsPerPage?: number;
  analysisAreaMax?: string;
  analysisAreaMin?: string;
  sortByAttribute?: string;
  state?: string;
  subState?: string;
  type?: string;
  userEmail?: string;
  searchString?: string;
  locationLogic?: string;
  locationIds?: string;
  locationStatement?: string;
  fields?: Array<string>;
  templateId?: number;
  selectedLocations?: string;
  selectedLocationsList?: Array<number>;
  listView?: string;
  aggregation?: boolean;
  listLevelAnalysis?: any;
}

/*export interface GetAnalysisDataCountForUserListResponse {
  TotalRows: number;
}*/

export interface GetAnalysisDataCountForUserListResponse {
  statistic_type: string;
  statistic: number;
}

export class ListNameSchema {
  id: number;
  userId: string;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
}
