/**
 * This query returns an array of list metadata relating to a list shared with a specific user
 * The command requires the following parameters:
 * @userID AS INT,
 */
export const getSharedListByUser = `
DECLARE @List AS nvarchar(max);
SELECT @List = STRING_AGG(list_id,', ')  FROM InternalShareRoutes WHERE admin_id =  @userID or user_id =  @userID
SELECT  L.*, LL.large_list_id FROM Lists L LEFT JOIN LargeLists LL ON L.id=LL.list_id WHERE L.id IN (SELECT [value] FROM STRING_SPLIT(@List, ',')) OR LL.list_id IN (SELECT [value] FROM STRING_SPLIT(@List, ',')) ORDER BY list_name
`;

export interface GetSharedListByUserType {
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
  large_list_id: number;
}
