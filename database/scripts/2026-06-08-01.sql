-- [GPV-5346]
-- Create new user fields for email export and backfill defaults.

USE [gfwpro]
GO

IF OBJECT_ID('tempdb..#CountryLanguageMap') IS NOT NULL
    DROP TABLE #CountryLanguageMap;

CREATE TABLE #CountryLanguageMap
(
    CountryName NVARCHAR(100) NOT NULL,
    LanguageCode NCHAR(2) NOT NULL
);

DECLARE @CountryLanguageCsvPath NVARCHAR(4000);

-- Set this path before execution to the SQL Server accessible absolute path.
-- Example: N''C:\repo\gfw-microservices\database\scripts\reference-data\country-language-map.csv''
SET @CountryLanguageCsvPath = NULL;

IF @CountryLanguageCsvPath IS NULL
BEGIN
    -- Explicit guard to avoid silently running without the mapping source file.
    RAISERROR('Set @CountryLanguageCsvPath to the absolute CSV path (accessible by SQL Server) before running this script.', 16, 1);
    RETURN;
END;

DECLARE @LoadMapSql NVARCHAR(MAX);
SET @LoadMapSql = N'
BULK INSERT #CountryLanguageMap
FROM ' + QUOTENAME(@CountryLanguageCsvPath, '''') + N'
WITH
(
    FIRSTROW = 2,              -- Skip CSV header row: Country,Language
    FIELDTERMINATOR = '','',   -- Standard comma-separated fields
    ROWTERMINATOR = ''0x0A'',  -- Unix LF row ending used by repo CSV files
    CODEPAGE = ''65001'',      -- Read file as UTF-8 to preserve special characters
    TABLOCK
);';

EXEC sp_executesql @LoadMapSql;

IF NOT EXISTS (SELECT 1 FROM #CountryLanguageMap)
BEGIN
    -- Prevent continuing when CSV is unreadable/misparsed and produced no rows.
    RAISERROR('Country-language CSV loaded zero rows.', 16, 1);
    RETURN;
END;

DECLARE @OrgId INT;
DECLARE @OrgName NVARCHAR(200);
DECLARE @OrgDbName NVARCHAR(200);
DECLARE @SQL NVARCHAR(MAX);

DECLARE org_cursor CURSOR FOR
SELECT id, organization_name, organization_db
FROM gfwpro.dbo.Organizations
WHERE organization_status_id = 2
  AND organization_db IS NOT NULL
  AND LTRIM(RTRIM(organization_db)) <> N'';

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        SET @SQL = N'
USE ' + QUOTENAME(@OrgDbName) + N';

IF COL_LENGTH(''dbo.Users'', ''deactivation_date'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [deactivation_date] SMALLDATETIME NULL;

IF COL_LENGTH(''dbo.Users'', ''country'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [country] NVARCHAR(100) NULL;

IF COL_LENGTH(''dbo.Users'', ''language'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [language] NCHAR(2) NULL;

;WITH OrgCountry AS
(
    SELECT TOP (1)
        ParsedCountry =
            CASE
                WHEN ap.organization_address IS NULL OR LTRIM(RTRIM(ap.organization_address)) = N''''
                    THEN NULL
                WHEN CHARINDEX('','', ap.organization_address) > 0
                    THEN LTRIM(RTRIM(RIGHT(ap.organization_address, CHARINDEX('','', REVERSE(ap.organization_address)) - 1)))
                ELSE LTRIM(RTRIM(ap.organization_address))
            END
    FROM dbo.AccountProfile ap
    ORDER BY ap.id DESC
)
UPDATE u
SET
    [country] = COALESCE(NULLIF(LTRIM(RTRIM(u.[country])), N''''), oc.ParsedCountry),
    [language] = COALESCE(NULLIF(LTRIM(RTRIM(u.[language])), N''''), clm.LanguageCode),
    [deactivation_date] = NULL
FROM dbo.Users u
CROSS JOIN OrgCountry oc
LEFT JOIN #CountryLanguageMap clm ON clm.CountryName = oc.ParsedCountry
WHERE u.is_system_user = 0;
';

        EXEC sp_executesql @SQL;
        PRINT N'Updated organization: ' + @OrgName + N' (' + @OrgDbName + N')';
    END TRY
    BEGIN CATCH
        PRINT N'ERROR updating organization: ' + @OrgName + N' (' + ISNULL(@OrgDbName, N'NULL') + N')';
        PRINT N'Error: ' + ERROR_MESSAGE();
    END CATCH;

    FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDbName;
END

CLOSE org_cursor;
DEALLOCATE org_cursor;

PRINT N'========================================';
PRINT N'GPV-5346 migration completed';
PRINT N'========================================';