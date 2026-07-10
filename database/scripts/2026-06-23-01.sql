/*
Add pending organization country support and carry it into new org AccountProfile.country.
*/

USE [gfwpro];
GO

IF COL_LENGTH('dbo.PendingAccounts', 'organization_country') IS NULL
BEGIN
    ALTER TABLE dbo.PendingAccounts
    ADD organization_country NVARCHAR(100) NULL;
END
GO

ALTER PROCEDURE [dbo].[uspCreateNewAccount]
    @orgName NVARCHAR(200),
    @orgAddress NVARCHAR(200),
    @orgCountry NVARCHAR(100) = NULL,
    @orgWebsite NVARCHAR(200),
    @isSubsidiary BIT = 0,
    @orgParent NVARCHAR(200) = '',
    @requestDate SMALLDATETIME
AS
    INSERT INTO dbo.PendingAccounts (
        organization_name,
        organization_address,
        organization_country,
        organization_website,
        organization_is_subsidiary,
        organization_parent,
        organization_requested_time
    )
    VALUES (@orgName, @orgAddress, @orgCountry, @orgWebsite, @isSubsidiary, @orgParent, @requestDate);

    SELECT SCOPE_IDENTITY() AS [organization_id];
GO

ALTER PROCEDURE [dbo].[uspUpdatePendingAccount]
    @orgID INT,
    @orgName NVARCHAR(200),
    @orgAddress NVARCHAR(200),
    @orgCountry NVARCHAR(100) = NULL,
    @orgWebsite NVARCHAR(200),
    @isSubsidiary BIT = 0,
    @orgParent NVARCHAR(200) = '',
    @classification_ids NVARCHAR(200)
AS
    UPDATE dbo.PendingAccounts
    SET organization_name = @orgName,
        organization_address = @orgAddress,
        organization_country = COALESCE(@orgCountry, organization_country),
        organization_website = @orgWebsite,
        organization_is_subsidiary = @isSubsidiary,
        organization_parent = @orgParent
    WHERE id = @orgID;

    DELETE FROM dbo.PendingAccountsClassifications
    WHERE pendingaccounts_id = @orgID;

    DECLARE @pos INT;
    DECLARE @len INT;
    DECLARE @strClassificationId VARCHAR(20);
    DECLARE @nClassificationId INT;

    SET @pos = 1;
    WHILE CHARINDEX(',', @classification_ids, @pos) > 0
    BEGIN
        SET @len = CHARINDEX(',', @classification_ids, @pos);
        SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos);
        SET @nClassificationId = CAST(@strClassificationId AS INT);

        INSERT INTO dbo.PendingAccountsClassifications
        VALUES (@orgID, @nClassificationId);

        SET @pos = @len + 1;
    END;

    SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1);
    SET @nClassificationId = CAST(@strClassificationId AS INT);

    INSERT INTO dbo.PendingAccountsClassifications
    VALUES (@orgID, @nClassificationId);
GO

ALTER PROCEDURE [dbo].[uspGetPendingAccountInformation]
    @pendingaccount_id INT
AS
    SELECT pa.organization_name,
           pa.organization_is_subsidiary,
           pa.organization_parent,
           pa.organization_website,
           pa.organization_address,
           pa.organization_country,
           pu.id,
           pu.first_name,
           pu.last_name,
           pu.title_id,
           pu.other_title,
           pu.email,
           pu.phone
    FROM dbo.PendingAccountsUsers pu
        LEFT JOIN dbo.PendingAccounts pa
            ON pu.pendingaccounts_id = pa.id
    WHERE pu.pendingaccounts_id = @pendingaccount_id;
GO
