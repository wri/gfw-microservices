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
/****** Object:  StoredProcedure [dbo].[uspDeleteLocation]    Script Date: 4/4/2023 7:43:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- Update EXISTING SPs


CREATE PROCEDURE [dbo].[uspDeleteLocation]
		@list_id INT,
		@location_id INT
	AS
	BEGIN
		DECLARE @TEMPLATE NVARCHAR(MAX)
		DECLARE @SQL NVARCHAR(MAX)
		DECLARE @list_table_name NVARCHAR(150)
		DECLARE @analysis_table_name NVARCHAR(150)

		SELECT @list_table_name = list_table_name FROM dbo.Lists WHERE id = @list_id
		SELECT @analysis_table_name = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

		PRINT @list_table_name
		PRINT @analysis_table_name

		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id = {LOCATION_ID}'
		SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_table_name)
		SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
		EXEC sp_executesql @SQL

		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id = {LOCATION_ID}'
		SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @analysis_table_name)
		SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
		EXEC sp_executesql @SQL
		
		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE list_id = {LIST_ID}
						AND (location_id = -1 OR location_id = {LOCATION_ID})'
		SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', 'Analyses-Dashboard')
		SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
		SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_id)
		EXEC sp_executesql @SQL
	END

	
GO
