import { stringList } from 'aws-sdk/clients/datapipeline';
import { field } from 'ts-object-to-model';

export interface Pages {
    numberOfPages: number;
}

export class ListNameSchema{

    id: string = undefined;
  
    @field({sourceName: 'user_id'})
    userId: string = undefined;
  
    @field({sourceName: 'list_name'})
    listName: string = undefined;
  
    @field({sourceName: 'list_table_name'})
    listTableName: string = undefined;
  
    @field({sourceName: 'list_analysis_table_name'})
    listAnalysisTableName: string = undefined;
}

export class FileGenerationFilter {
    analysisArea?: string;
    analysisAreaOperator?: string;
    combinedColumns?: string;
    combinedColumnsSplited?: Array<string>;
    country?: string;
    file?: stringList;
    geometry?: number;
    key?: string;
    listID: number | undefined;
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
  