/**
 * @param list_id INT
 */
export const getTableColumns = `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = (
    SELECT list_table_name
    FROM Lists
    WHERE id = @list_id
  )`;

export interface GetTableColumnsType {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
}
