/**
 * This query is used to get all lists for an organization,
 * including large lists and if during the analysis process had some error.
 */

export const getAllLists = `SELECT
  L.*,
  LL.large_list_id,
  LAS.AnalysisID,
  LAS.Status,
  LAS.ErrorInfo,
  LAS.UpdateTime
FROM Lists L
LEFT JOIN LargeLists LL ON L.id=LL.list_id
LEFT JOIN ListsAnalysisStatus LAS ON LAS.ListID = L.id
ORDER BY list_name`;

export class AllLists {
  id: number;
  user_id: number;
  template_id: number;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
  list_status_id: number;
  list_error_message: string;
  location_classification: string;
  custom_attribute_names: string;
  custom_attribute_types: string;
  list_locations_count: number;
  lock_status: string;
  lock_user_id: number;
  associated_gfwlist: string;
  dashboard_last_submit: string;
  dashboard_last_results: string;
  vector_tiles_storage_path: string;
  error_file_storage_path: string;
  vector_tiles_last_updated: string;
  large_list_id: number;
  AnalysisID: string;
  Status: number;
  ErrorInfo: string;
  UpdateTime: string;
}
