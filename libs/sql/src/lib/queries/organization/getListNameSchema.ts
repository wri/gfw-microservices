export const getListNameSchema = `SELECT id, user_id, list_name, list_table_name, list_analysis_table_name FROM Lists WHERE id = @list_id`;

export class ListNameSchema {
  id: number;
  userId: string;
  list_name: string;
  list_table_name: string;
  list_analysis_table_name: string;
}
