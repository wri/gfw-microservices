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
/****** Object:  StoredProcedure [dbo].[uspGetAdministrativeAreasData]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetAdministrativeAreasData]
	@country NVARCHAR(150),
	@states NVARCHAR(MAX),
	@sub_states NVARCHAR(MAX)
AS
	--Declare Variables.
	DECLARE @SQL NVARCHAR(MAX)

	--Setup query to filter results by country/state/substate.
	SET @SQL = 'SELECT
					[id],[Location Name],[Country],[State],[Sub State],[Latitude],[Longitude],[Location Classification],[Size],[gadmid],[location_id]
				FROM
					[gfwpro].[dbo].[list-administrativeAreas36]
				WHERE
				Country = @country'

	--Filter by states, if states are provided.
	IF(LEN(@states) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [State] IN (SELECT [value] FROM STRING_SPLIT(@states, '',''))'
	END

	--Filter by sub states, if sub states are provided.
	IF(LEN(@sub_states) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Sub State] IN (SELECT [value] FROM STRING_SPLIT(@sub_states, '',''))'
	END

	--Execute Query.
	 EXEC sp_executesql @SQL,
							N'@country NVARCHAR(150), @states NVARCHAR(MAX), @sub_states NVARCHAR(MAX)',
							@country, @states, @sub_states
GO
