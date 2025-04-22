/*    ==Scripting Parameters==

    Source Server Version : SQL Server 2017 (14.0.3401)
    Source Database Engine Edition : Microsoft SQL Server Standard Edition
    Source Database Engine Type : Standalone SQL Server

    Target Server Version : SQL Server 2017
    Target Database Engine Edition : Microsoft SQL Server Standard Edition
    Target Database Engine Type : Standalone SQL Server
*/
USE [gfwpro]
GO
/****** Object:  StoredProcedure [dbo].[uspGetAdministrativeAreasGlobalId]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[uspGetAdministrativeAreasGlobalId]
	@global_ids NVARCHAR(MAX) = NULL
AS
	IF @global_ids IS NULL OR @global_ids = ''
		BEGIN
			SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas36]
			SELECT * FROM [analysis-administrativeAreas]
		END
	ELSE
		DECLARE @LIST_SQL NVARCHAR(MAX)
		SET @LIST_SQL = 'SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas36] WHERE gadmid IN (''{GADMIDS}'')'
		SET @LIST_SQL = REPLACE(@LIST_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @LIST_SQL
		DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
		SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-administrativeAreas] WHERE location_id IN (SELECT location_id FROM [list-administrativeAreas36] WHERE gadmid IN (''{GADMIDS}''))'
		SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @ANALYSIS_SQL
GO
