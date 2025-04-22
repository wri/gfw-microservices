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
/****** Object:  StoredProcedure [dbo].[uspUpdateAdministrativeAreas]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspUpdateAdministrativeAreas]
	@Country NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@LocationClassification NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@Size DECIMAL(18,6),
	@LocationName NVARCHAR(150),
	@location_id INT
AS
	INSERT INTO [temp-list-administrativeAreas36] (
	[Country],
	[State],
	[Sub State],
	[Latitude],
	[Longitude],
	[Location Classification],
	[Geometry],
	[Size],
	[Location Name],
	[location_id])
	VALUES (@Country, @State, @Substate, @Latitude, @Longitude, @LocationClassification, @Geometry, @Size, @LocationName, @location_id)
GO
