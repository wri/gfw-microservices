import { ListsAnalysisStatus } from '../../entity';

export const getAllLists = `SELECT
    L.*,
    LL.large_list_id,
    JSON_QUERY((
        SELECT
            las.[options],
            las.AnalysisID as analysisId,
            las.bundle_creation_time,
            las.ErrorInfo,
            las.expiration_time,
            las.s3_url,
            las.Status as status,
            las.UpdateTime
        FROM ListsAnalysisStatus las
        WHERE las.ListID = L.id
        FOR JSON PATH
    )) AS listAnalysesStatus
FROM Lists L
LEFT JOIN LargeLists LL ON L.id = LL.list_id
WHERE (@list_id IS NULL OR L.id = @list_id)
ORDER BY list_name;`;

export interface ListsType {
  id: number;
  user_id: number;
  template_id: number;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
  list_status_id: number;
  list_error_message: string | null;
  location_classification: string | null;
  custom_attribute_names: string | null;
  custom_attribute_types: string | null;
  list_locations_count: number | null;
  lock_status: Date | null;
  lock_user_id: number | null;
  associated_gfwlist: number | null;
  dashboard_last_submit: Date | null;
  dashboard_last_results: Date | null;
  vector_tiles_storage_path: string | null;
  error_file_storage_path: string | null;
  vector_tiles_last_updated: Date | null;
  isGlobalForestWatchList?: boolean;
  listAnalysesStatus?: ListsAnalysisStatus[];
  version: number;
  Commodity: string | null;
  large_list_id: number | null;
}
