export const getAllLists = `SELECT  L.*, LL.large_list_id
FROM Lists L
LEFT JOIN LargeLists LL ON L.id=LL.list_id
ORDER BY list_name`;

export interface ListsType {
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
  lock_status: Date;
  lock_user_id: number;
  associated_gfwlist: number;
  dashboard_last_submit: Date;
  dashboard_last_results: Date;
  vector_tiles_storage_path: string;
  error_file_storage_path: string;
  vector_tiles_last_updated: Date;
}
