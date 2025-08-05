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
/****** Object:  StoredProcedure [dbo].[uspCreateNewAccount]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspCreateNewAccount]
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = '',
	@requestDate SMALLDATETIME

AS
	INSERT INTO PendingAccounts VALUES(@orgName, @orgAddress, @orgWebsite, @isSubsidiary, @orgParent, @requestDate)
	SELECT SCOPE_IDENTITY() AS [organization_id];
GO