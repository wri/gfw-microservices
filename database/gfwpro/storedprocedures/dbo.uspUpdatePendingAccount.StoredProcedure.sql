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
/****** Object:  StoredProcedure [dbo].[uspUpdatePendingAccount]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspUpdatePendingAccount]
	@orgID INT,
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgCountry NVARCHAR(100) = NULL,
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = '',
	@classification_ids NVARCHAR(200)
AS
	-- Update pending accounts table
	UPDATE PendingAccounts SET
		organization_name = @orgName,
		[organization_address] = @orgAddress,
		organization_country = COALESCE(@orgCountry, organization_country),
		organization_website = @orgWebsite,
		organization_is_subsidiary = @isSubsidiary,
		organization_parent = @orgParent
	WHERE id=@orgID

	-- Delete classifications for the organization before re-adding
	DELETE FROM PendingAccountsClassifications WHERE pendingaccounts_id = @orgID

	-- Add the classifications for the organization
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strClassificationId varchar(20)
	DECLARE @nClassificationId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @classification_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @classification_ids, @pos)
		SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
		SET @nClassificationId = CAST(@strClassificationId AS INT)
		INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
		SET @pos = @len + 1
	END
	SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
	SET @nClassificationId = CAST(@strClassificationId AS INT)
	INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
GO
