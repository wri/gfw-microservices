/*    ==Scripting Parameters==

    Source Server Version : SQL Server 2017 (14.0.3401)
    Source Database Engine Edition : Microsoft SQL Server Standard Edition
    Source Database Engine Type : Standalone SQL Server

    Target Server Version : SQL Server 2017
    Target Database Engine Edition : Microsoft SQL Server Standard Edition
    Target Database Engine Type : Standalone SQL Server
*/
USE [clientstore-BlueRaster]
GO
/****** Object:  StoredProcedure [dbo].[uspDeleteLocationIdsFilteredDataForUserList]    Script Date: 4/4/2023 7:43:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[uspDeleteLocationIdsFilteredDataForUserList]
	@listID INT,
	@Country NVARCHAR(150) = NULL,
	@State NVARCHAR(150) = NULL,
	@SubState NVARCHAR(150) = NULL,
	@AnalysisAreaFilter FLOAT = NULL,
	@AnalysisAreaOperator VARCHAR(10)='>'
AS

DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listAnalysisTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''
DECLARE @TEMPLATE NVARCHAR(MAX)

SET NOCOUNT ON
-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID


SET @SQL = N'
			DECLARE @KeyValuesHoldingTable TABLE (
				location_id INT
			)
			;WITH DeleteTableIds AS (SELECT location_id FROM [{LOCATION_TABLE}] ';

IF @Country IS NOT NULL 
	SET @Filters = + @Filters + ' AND Country = @Country'

IF @State IS NOT NULL 
	SET @Filters = + @Filters + ' AND State = @State'

IF @SubState IS NOT NULL 
	SET @Filters = + @Filters + ' AND [Sub State] = @SubState'

IF ISNUMERIC( @AnalysisAreaFilter ) = 1
BEGIN
	PRINT @AnalysisAreaFilter
	IF @AnalysisAreaOperator NOT IN('>=', '<=', '<', '>')
		RAISERROR ('Invalid @AnalysisAreaOperator', -1, 1); 
	SET @Filters = + @Filters + ' AND [Analysis Area] ' + @AnalysisAreaOperator + ' @AnalysisAreaFilter '
END

-- Return data from both tables
SET @SQL = @SQL + ' WHERE 1=1 '+@Filters + ')
INSERT INTO @KeyValuesHoldingTable SELECT * FROM DeleteTableIds

';

	SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
	'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listLocationTableName)

	SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
	'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listAnalysisTableName)
	
	SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE list_id = {LIST_ID}
					AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
					'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', 'Analyses-Dashboard')
	SET @SQL = REPLACE(@SQL, '{LIST_ID}',  @listID)


SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);

EXEC sp_executesql @SQL, 
					N'@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaFilter FLOAT, @AnalysisAreaOperator VARCHAR(10)',
					@Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaFilter=@AnalysisAreaFilter, @AnalysisAreaOperator=@AnalysisAreaOperator;
					
					
					
					
GO
