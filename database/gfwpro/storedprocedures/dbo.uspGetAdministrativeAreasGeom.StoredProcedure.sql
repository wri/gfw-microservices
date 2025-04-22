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
/****** Object:  StoredProcedure [dbo].[uspGetAdministrativeAreasGeom]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetAdministrativeAreasGeom]
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas36]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas36] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END

GO
