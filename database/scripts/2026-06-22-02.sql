-- Diagnostic: List all organizations with their AccountProfile address
-- Run this to identify which orgs have a country in the address and which don't.
-- Tool: SQL MultiScript

USE [gfwpro];
GO
SET NOCOUNT ON;

IF OBJECT_ID('tempdb..#OrgAddressAudit') IS NOT NULL DROP TABLE #OrgAddressAudit;
CREATE TABLE #OrgAddressAudit
(
    OrganizationId   INT            NOT NULL,
    OrganizationName NVARCHAR(200)  NULL,
    OrganizationDb   SYSNAME        NOT NULL,
    DbOnline         NVARCHAR(10)   NOT NULL,
    OrgAddress       NVARCHAR(200)  NULL,
    CountryColumnValue NVARCHAR(100) NULL,
    AddressLastSegment NVARCHAR(200) NULL
);

-- Defensive guard: if only part of this script is executed in an existing session,
-- ensure the temp table has the expected schema.
IF COL_LENGTH('tempdb..#OrgAddressAudit', 'CountryColumnValue') IS NULL
BEGIN
    ALTER TABLE #OrgAddressAudit ADD CountryColumnValue NVARCHAR(100) NULL;
END;

DECLARE
    @OrgDb   SYSNAME,
    @OrgId   INT,
    @OrgName NVARCHAR(200),
    @DbOnline NVARCHAR(10),
    @Sql     NVARCHAR(MAX);

DECLARE org_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT
    o.id,
    o.organization_name,
    o.organization_db,
    ISNULL(d.state_desc, 'OFFLINE') AS DbOnline
FROM dbo.Organizations o
LEFT JOIN sys.databases d
    ON d.name = o.organization_db
WHERE o.organization_db IS NOT NULL
  AND LTRIM(RTRIM(o.organization_db)) <> N''
ORDER BY o.organization_name;

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDb, @DbOnline;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @DbOnline = 'ONLINE'
    BEGIN
        BEGIN TRY
            SET @Sql = N'
USE ' + QUOTENAME(@OrgDb) + N';

DECLARE @Addr NVARCHAR(200);
DECLARE @Country NVARCHAR(100);
SELECT TOP (1) @Addr = organization_address
FROM dbo.AccountProfile
ORDER BY id DESC;

IF COL_LENGTH(''dbo.AccountProfile'', ''country'') IS NOT NULL
BEGIN
    SELECT TOP (1) @Country = country
    FROM dbo.AccountProfile
    ORDER BY id DESC;
END
ELSE
BEGIN
    SET @Country = NULL;
END

SELECT
    @P_OrgId   AS OrganizationId,
    @P_OrgName AS OrganizationName,
    @P_OrgDb   AS OrganizationDb,
    N''ONLINE''  AS DbOnline,
    ISNULL(@Addr, N'''') AS OrgAddress,
    @Country AS CountryColumnValue,
    CASE
        WHEN @Addr IS NULL OR LTRIM(RTRIM(@Addr)) = N'''' THEN N''''
        WHEN CHARINDEX('','', @Addr) > 0
            THEN LTRIM(RTRIM(RIGHT(@Addr, CHARINDEX('','', REVERSE(@Addr)) - 1)))
        ELSE LTRIM(RTRIM(@Addr))
    END AS AddressLastSegment;
';
            INSERT INTO #OrgAddressAudit
            (OrganizationId, OrganizationName, OrganizationDb, DbOnline, OrgAddress, CountryColumnValue, AddressLastSegment)
            EXEC sp_executesql
                @Sql,
                N'@P_OrgId INT, @P_OrgName NVARCHAR(200), @P_OrgDb SYSNAME',
                @P_OrgId   = @OrgId,
                @P_OrgName = @OrgName,
                @P_OrgDb   = @OrgDb;
        END TRY
        BEGIN CATCH
            INSERT INTO #OrgAddressAudit
            (OrganizationId, OrganizationName, OrganizationDb, DbOnline, OrgAddress, CountryColumnValue, AddressLastSegment)
            VALUES (@OrgId, @OrgName, @OrgDb, 'ERROR', ERROR_MESSAGE(), NULL, NULL);
        END CATCH;
    END
    ELSE
    BEGIN
        INSERT INTO #OrgAddressAudit
        (OrganizationId, OrganizationName, OrganizationDb, DbOnline, OrgAddress, CountryColumnValue, AddressLastSegment)
        VALUES (@OrgId, @OrgName, @OrgDb, @DbOnline, NULL, NULL, NULL);
    END

    FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDb, @DbOnline;
END;

CLOSE org_cursor;
DEALLOCATE org_cursor;

------------------------------------------------------------
-- RESULTS: all orgs with address and parsed last segment
------------------------------------------------------------
SELECT
    OrganizationId,
    OrganizationName,
    OrganizationDb,
    DbOnline,
    OrgAddress,
    CountryColumnValue,
    AddressLastSegment
FROM #OrgAddressAudit
ORDER BY OrganizationName;
GO
