export const getAnalysisGFWColumns = `
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = (SELECT list_analysis_table_name FROM GFWLists WHERE id = @list_id) AND COLUMN_NAME != 'id' AND COLUMN_NAME != 'location_id';
`;
