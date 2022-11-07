import { stringList } from 'aws-sdk/clients/datapipeline';

export interface GenerationFileRequest {
  analysisArea?: string;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  combinedColumnsSplited?: Array<string>;
  country?: string;
  file?: stringList;
  geometry?: number;
  key?: string;
  listID: number;
  listName?: string;
  orderType?: string;
  organizationDatabase?: string;
  page?: number;
  pageSize?: number;
  rowsPerPage?: number;
  selectedAreaMax?: string;
  selectedAreaMin?: string;
  sortByAttribute?: string;
  state?: string;
  subState?: string;
  type?: string;
  userEmail?: string;
}

/*export interface GetAnalysisDataCountForUserListResponse {
  TotalRows: number;
}*/

export interface GetAnalysisDataCountForUserListResponse {
  statistic_type: string;
  statistic: number;
}

export class ListNameSchema {
  id: string;
  userId: string;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
}
