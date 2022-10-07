import { stringList } from 'aws-sdk/clients/datapipeline';

export interface Pages {
  numberOfPages: number;
}

export interface ListNameSchema{
  id: string;
  user_id: string;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
}

export interface Param {
  field: string;
  type: any;
  value: any;
}

export interface Filters {
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
