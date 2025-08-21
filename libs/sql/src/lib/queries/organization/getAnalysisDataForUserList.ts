/**
 * [dbo].[uspGetAnalysisDataForUserList]
	@listID INT
 * @OrderByColumn NVARCHAR(MAX) = NULL
 * -- [Investment Name]
	@Order NVARCHAR(5) = 'ASC'
 * @Country NVARCHAR(150) = NULL
 * @State NVARCHAR(150) = NULL
 * @SubState NVARCHAR(150) = NULL
 * @AnalysisAreaFilter FLOAT = NULL
 * @AnalysisAreaOperator VARCHAR(10)='>'
 */
export const getAnalysisDataForUserList = `
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listAnalysisTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID

-- Default column location name is not found
IF @OrderByColumn = '[Location Name]' AND COL_LENGTH(@listLocationTableName, 'Location Name') IS NULL
BEGIN
	SET @OrderByColumn = '[Investment Name]'
END

-- Obtain the needed columns from the List Location Table. (All but Geometry)
SELECT @listLocationTableCols = STUFF(
	(
		SELECT '], L.[' + [name] FROM sys.columns
		WHERE
			[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
			AND [name] NOT IN ('Geometry')
			FOR XML PATH('')
	),1,3,'') + ']';

SET @SQL = N';WITH MyListTable AS (SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS} FROM [{LOCATION_TABLE}] L), ';			
			
DECLARE @listAnalysisTableCols NVARCHAR(MAX)

-- Obtain the needed columns from the List Analysis Table. (All but List ID)
SELECT @listAnalysisTableCols = STUFF(
	(
		SELECT '], A.[' + [name] FROM sys.columns
		WHERE
			[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
			AND [name] NOT IN ('id')
			FOR XML PATH('')
	),1,3,'') + ']';

-- ADD Filters
IF @Country IS NOT NULL 
	SET @Filters = + @Filters + ' AND Country = @Country'

IF @State IS NOT NULL 
	SET @Filters = + @Filters + ' AND State = @State'

IF @SubState IS NOT NULL 
	SET @Filters = + @Filters + ' AND [Sub State] = @SubState'

IF ISNUMERIC( @AnalysisAreaFilter ) = 1
BEGIN
	IF @AnalysisAreaOperator NOT IN('>=', '<=', '<', '>')
		RAISERROR ('Invalid @AnalysisAreaOperator', -1, 1); 
	SET @Filters = + @Filters + ' AND [Analysis Area] ' + @AnalysisAreaOperator + ' @AnalysisAreaFilter '
END

-- Return data from both tables
SET @SQL = @SQL + ' MyAnalysisTable AS(SELECT {LIST_ID} As analysis_list_id, {ANALYSIS_COLUMNS} FROM [{ANALYSIS_TABLE}] A) 
					SELECT * FROM MyListTable INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND  MyListTable.location_id = MyAnalysisTable.location_id 
					WHERE 1=1 '+@Filters+'
					ORDER BY '+@OrderByColumn + ' '+@Order;	

SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
SET @SQL = REPLACE(@SQL, '{ANALYSIS_COLUMNS}', @listAnalysisTableCols);
SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @listAnalysisTableName);

EXEC sp_executesql @SQL, 
					N'@OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaFilter FLOAT, @AnalysisAreaOperator VARCHAR(10)',
					@OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaFilter=@AnalysisAreaFilter, @AnalysisAreaOperator=@AnalysisAreaOperator;
					
`;
