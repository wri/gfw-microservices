/*========================================================================================
  -- GPV-4654
DB: Organization accounts: Troubleshoot missing account request dates
========================================================================================*/

USE [gfwpro]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[uspCreateNewAccount]
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = '',
	@requestDate SMALLDATETIME
AS
BEGIN
	-- Validate requestDate is NOT NULL
	IF @requestDate IS NULL
	BEGIN
		RAISERROR('organization_requested_time cannot be NULL', 16, 1);
		RETURN;
	END

	-- Original INSERT statement unchanged
	INSERT INTO PendingAccounts 
	VALUES(@orgName, @orgAddress, @orgWebsite, @isSubsidiary, @orgParent, @requestDate);

	SELECT SCOPE_IDENTITY() AS [organization_id];
END
GO