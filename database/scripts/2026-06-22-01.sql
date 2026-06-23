USE [gfwpro];
GO
SET NOCOUNT ON;

------------------------------------------------------------
-- 0) SAFETY SWITCH
------------------------------------------------------------
DECLARE @DryRun BIT = 0; -- 1 = preview only, 0 = execute updates
DECLARE @AbortOnUnmatched BIT = 0; -- 1 = stop if any CSV org name has no Organizations match, 0 = don't stop
DECLARE @isNonProdEnvironment BIT = 1; -- 1 = default blank Country values to United States

------------------------------------------------------------
-- 1) STAGE CSV MAP (OrgName -> Country)
-- Keep committed code empty; paste values locally before execution
------------------------------------------------------------
IF OBJECT_ID('tempdb..#OrgCountryMap') IS NOT NULL DROP TABLE #OrgCountryMap;
CREATE TABLE #OrgCountryMap
(
    OrgName  NVARCHAR(200) NOT NULL,
    Country  NVARCHAR(100) NOT NULL
);

-- IMPORTANT FOR GITHUB:
-- Keep this section empty in committed code (do not commit real organization data).
--
-- LOCAL RUN STEPS:
-- 1) Before executing, uncomment the INSERT below.
-- 2) Paste rows from your file (Organization Name, Country).
-- 3) Run with @DryRun = 1 first, then @DryRun = 0 after verification.
-- 4) Revert/remove inserted values before committing.

INSERT INTO #OrgCountryMap (OrgName, Country)
VALUES
    (N'REPLACE_ORG_NAME_1', N'REPLACE_COUNTRY_1'),
    (N'REPLACE_ORG_NAME_2', N'REPLACE_COUNTRY_2');


------------------------------------------------------------
-- 2) VALIDATIONS
------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM #OrgCountryMap)
BEGIN
    RAISERROR('No rows in #OrgCountryMap. Aborting.', 16, 1);
    RETURN;
END;

-- Duplicate org names in CSV after normalization
IF EXISTS
(
    SELECT 1
    FROM (
        SELECT UPPER(LTRIM(RTRIM(OrgName))) AS OrgKey, COUNT(*) AS Cnt
        FROM #OrgCountryMap
        GROUP BY UPPER(LTRIM(RTRIM(OrgName)))
    ) d
    WHERE d.Cnt > 1
)
BEGIN
    RAISERROR('Duplicate org names found in CSV map after trimming/case normalization.', 16, 1);
    RETURN;
END;

------------------------------------------------------------
-- 3) BUILD WORKLIST (only mapped orgs + online databases)
------------------------------------------------------------
IF OBJECT_ID('tempdb..#Worklist') IS NOT NULL DROP TABLE #Worklist;
CREATE TABLE #Worklist
(
    OrganizationId   INT            NOT NULL,
    OrganizationName NVARCHAR(200)  NULL,
    OrganizationDb   SYSNAME        NOT NULL,
    NewCountry       NVARCHAR(100)  NULL,
    DefaultedToUS    BIT            NOT NULL,
    CountrySource    NVARCHAR(30)   NOT NULL
);

INSERT INTO #Worklist (OrganizationId, OrganizationName, OrganizationDb, NewCountry, DefaultedToUS, CountrySource)
SELECT
    o.id,
    o.organization_name,
    o.organization_db,
    NULLIF(LTRIM(RTRIM(m.Country)), N''),
    0,
    CASE
        WHEN m.OrgName IS NULL THEN N'NO_CSV_MATCH'
        WHEN NULLIF(LTRIM(RTRIM(m.Country)), N'') IS NULL THEN N'CSV_BLANK_COUNTRY'
        ELSE N'CSV_COUNTRY'
    END
FROM dbo.Organizations o
LEFT JOIN #OrgCountryMap m
  ON UPPER(LTRIM(RTRIM(o.organization_name))) = UPPER(LTRIM(RTRIM(m.OrgName)))
JOIN sys.databases d
  ON d.name = o.organization_db
 AND d.state_desc = 'ONLINE'
WHERE o.organization_db IS NOT NULL
    AND LTRIM(RTRIM(o.organization_db)) <> N''
    AND (@isNonProdEnvironment = 1 OR m.OrgName IS NOT NULL);

-- Capture unmatched CSV orgs so they can be reviewed and optionally block execution
IF OBJECT_ID('tempdb..#UnmatchedOrgCountryMap') IS NOT NULL DROP TABLE #UnmatchedOrgCountryMap;
CREATE TABLE #UnmatchedOrgCountryMap
(
        CsvOrgName NVARCHAR(200) NOT NULL,
        CsvCountry NVARCHAR(100) NOT NULL
);

INSERT INTO #UnmatchedOrgCountryMap (CsvOrgName, CsvCountry)
SELECT
        m.OrgName,
        m.Country
FROM #OrgCountryMap m
LEFT JOIN dbo.Organizations o
    ON UPPER(LTRIM(RTRIM(o.organization_name))) = UPPER(LTRIM(RTRIM(m.OrgName)))
WHERE o.id IS NULL;

-- Preview: CSV rows that matched an Organizations row in gfwpro
SELECT
    m.OrgName AS CsvOrgName,
    o.organization_name AS MatchedOrganizationName,
    o.organization_db AS MatchedOrganizationDb,
    m.Country AS CsvCountry
FROM #OrgCountryMap m
JOIN dbo.Organizations o
    ON UPPER(LTRIM(RTRIM(o.organization_name))) = UPPER(LTRIM(RTRIM(m.OrgName)))
ORDER BY o.organization_name;

-- Preview: CSV rows that did NOT match an Organizations row in gfwpro
SELECT *
FROM #UnmatchedOrgCountryMap
ORDER BY CsvOrgName;

IF @AbortOnUnmatched = 1 AND EXISTS (SELECT 1 FROM #UnmatchedOrgCountryMap)
BEGIN
        RAISERROR('Unmatched CSV organization names detected. Review #UnmatchedOrgCountryMap result set and fix names before running updates.', 16, 1);
        RETURN;
END;

-- Show planned updates
SELECT *
FROM #Worklist
ORDER BY OrganizationDb;

-- Resolve country in priority order: CSV -> USA in non-prod
IF OBJECT_ID('tempdb..#CountryResolutionPreview') IS NOT NULL DROP TABLE #CountryResolutionPreview;
CREATE TABLE #CountryResolutionPreview
(
    OrganizationId   INT           NOT NULL,
    OrganizationName NVARCHAR(200) NULL,
    OrganizationDb   SYSNAME       NOT NULL,
    WorklistCountry  NVARCHAR(100) NULL,
    ResolvedCountry  NVARCHAR(100) NULL,
    ResolutionSource NVARCHAR(40)  NOT NULL
);

INSERT INTO #CountryResolutionPreview
(
    OrganizationId,
    OrganizationName,
    OrganizationDb,
    WorklistCountry,
    ResolvedCountry,
    ResolutionSource
)
SELECT
    w.OrganizationId,
    w.OrganizationName,
    w.OrganizationDb,
    w.NewCountry AS WorklistCountry,
    CASE
        WHEN NULLIF(LTRIM(RTRIM(w.NewCountry)), N'') IS NOT NULL THEN LTRIM(RTRIM(w.NewCountry))
        WHEN @isNonProdEnvironment = 1 THEN N'United States'
        ELSE NULL
    END AS ResolvedCountry,
    CASE
        WHEN NULLIF(LTRIM(RTRIM(w.NewCountry)), N'') IS NOT NULL THEN N'CSV_COUNTRY'
        WHEN @isNonProdEnvironment = 1 THEN N'NONPROD_DEFAULT_USA'
        ELSE N'CSV_COUNTRY_MISSING'
    END AS ResolutionSource
FROM #Worklist w;

-- Show planned updates with final resolved country values
SELECT
    OrganizationId,
    OrganizationName,
    OrganizationDb,
    WorklistCountry,
    ResolvedCountry,
    ResolutionSource
FROM #CountryResolutionPreview
ORDER BY OrganizationDb;

-- Preview: orgs that will default to US in non-prod mode
SELECT
    OrganizationId,
    OrganizationName,
    OrganizationDb,
    ResolvedCountry,
    ResolutionSource
FROM #CountryResolutionPreview
WHERE ResolutionSource = N'NONPROD_DEFAULT_USA'
ORDER BY OrganizationName;

-- Preview: Organizations table rows selected for update (from gfwpro)
SELECT
    o.id AS OrganizationId,
    o.organization_name AS OrganizationName,
    o.organization_db AS OrganizationDb,
    r.ResolvedCountry AS NewCountry,
    r.ResolutionSource
FROM #CountryResolutionPreview r
JOIN dbo.Organizations o
    ON o.id = r.OrganizationId
WHERE r.ResolvedCountry IS NOT NULL
ORDER BY o.organization_name;

IF @DryRun = 1
BEGIN
    PRINT 'DRY RUN: no updates executed.';
    RETURN;
END;

------------------------------------------------------------
-- 4) BACKUP + LOG TABLES
------------------------------------------------------------
IF OBJECT_ID('tempdb..#AccountProfileCountryBackup') IS NOT NULL DROP TABLE #AccountProfileCountryBackup;
CREATE TABLE #AccountProfileCountryBackup
(
    OrganizationDb SYSNAME       NOT NULL,
    AccountProfileId INT         NOT NULL,
    OldCountry NVARCHAR(100)     NULL,
    BackupTs DATETIME2           NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('tempdb..#RunLog') IS NOT NULL DROP TABLE #RunLog;
CREATE TABLE #RunLog
(
    OrganizationDb SYSNAME       NOT NULL,
    Status NVARCHAR(20)          NOT NULL,
    RowsChanged INT              NULL,
    Message NVARCHAR(1000)       NULL,
    LoggedAt DATETIME2           NOT NULL DEFAULT SYSUTCDATETIME()
);

------------------------------------------------------------
-- 5) LOOP CLIENTSTORES + ADD [country] COLUMN + UPDATE AccountProfile
------------------------------------------------------------
DECLARE
    @OrgDb SYSNAME,
    @Country NVARCHAR(100),
    @Sql NVARCHAR(MAX);

DECLARE wl_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT OrganizationDb, ResolvedCountry
FROM #CountryResolutionPreview
WHERE ResolvedCountry IS NOT NULL
ORDER BY OrganizationDb;

OPEN wl_cursor;
FETCH NEXT FROM wl_cursor INTO @OrgDb, @Country;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        SET @Sql = N'
USE ' + QUOTENAME(@OrgDb) + N';

-- Add [country] column to AccountProfile if it does not already exist
IF COL_LENGTH(''dbo.AccountProfile'', ''country'') IS NULL
    ALTER TABLE [dbo].[AccountProfile] ADD [country] NVARCHAR(100) NULL;

DECLARE @TargetCol SYSNAME = N''country'';

DECLARE @BkpSql NVARCHAR(MAX) =
N''INSERT INTO tempdb..#AccountProfileCountryBackup (OrganizationDb, AccountProfileId, OldCountry)
  SELECT @P_OrgDb, id, '' + QUOTENAME(@TargetCol) + N''
  FROM dbo.AccountProfile'';

EXEC sp_executesql @BkpSql, N''@P_OrgDb SYSNAME'', @P_OrgDb = @P_OrgDb;

DECLARE @UpdSql NVARCHAR(MAX) =
N''UPDATE ap
  SET '' + QUOTENAME(@TargetCol) + N'' = @P_Country
  FROM dbo.AccountProfile ap
  WHERE ISNULL(LTRIM(RTRIM('' + QUOTENAME(@TargetCol) + N'')), N'''''''') <> LTRIM(RTRIM(@P_Country));

  SELECT @@ROWCOUNT AS RowsChanged;'';

DECLARE @RC TABLE (RowsChanged INT);
INSERT INTO @RC (RowsChanged)
EXEC sp_executesql @UpdSql, N''@P_Country NVARCHAR(100)'', @P_Country = @P_Country;

INSERT INTO tempdb..#RunLog (OrganizationDb, Status, RowsChanged, Message)
SELECT @P_OrgDb, N''UPDATED'', RowsChanged, N''Country updated in AccountProfile''
FROM @RC;
';

        EXEC sp_executesql
            @Sql,
            N'@P_OrgDb SYSNAME, @P_Country NVARCHAR(100)',
            @P_OrgDb = @OrgDb,
            @P_Country = @Country;
    END TRY
    BEGIN CATCH
        INSERT INTO #RunLog (OrganizationDb, Status, RowsChanged, Message)
        VALUES (@OrgDb, N'ERROR', NULL, ERROR_MESSAGE());
    END CATCH;

    FETCH NEXT FROM wl_cursor INTO @OrgDb, @Country;
END;

CLOSE wl_cursor;
DEALLOCATE wl_cursor;

------------------------------------------------------------
-- 6) RESULTS
------------------------------------------------------------
SELECT * FROM #RunLog ORDER BY OrganizationDb;
SELECT * FROM #AccountProfileCountryBackup ORDER BY OrganizationDb, AccountProfileId;
GO