-- Diagnostic: check AccountProfile.country value across all active org databases,
-- and count how many non-system users are still missing country/language.

USE [gfwpro]
GO

SET NOCOUNT ON;

DECLARE @OrgName NVARCHAR(200);
DECLARE @OrgDb   NVARCHAR(200);
DECLARE @SQL     NVARCHAR(MAX);
DECLARE @Results TABLE
(
    org_name                NVARCHAR(200),
    org_db                  NVARCHAR(200),
    account_profile_country NVARCHAR(100),
    users_missing_country   INT,
    users_missing_language  INT
);

DECLARE org_cursor CURSOR FOR
SELECT organization_name, organization_db
FROM gfwpro.dbo.Organizations
WHERE organization_db IS NOT NULL
  AND LTRIM(RTRIM(organization_db)) <> N'';

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgName, @OrgDb;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        SET @SQL = N'
SELECT
    @OrgName AS org_name,
    @OrgDb   AS org_db,
    (SELECT TOP (1) country FROM ' + QUOTENAME(@OrgDb) + N'.dbo.AccountProfile ORDER BY id DESC) AS account_profile_country,
    (SELECT COUNT(*) FROM ' + QUOTENAME(@OrgDb) + N'.dbo.Users WHERE NULLIF(LTRIM(RTRIM(country)),  N'''') IS NULL OR UPPER(LTRIM(RTRIM(country)))  = N''NULL'') AS users_missing_country,
    (SELECT COUNT(*) FROM ' + QUOTENAME(@OrgDb) + N'.dbo.Users WHERE NULLIF(LTRIM(RTRIM(language)), N'''') IS NULL OR UPPER(LTRIM(RTRIM(language))) = N''NULL'') AS users_missing_language;
';
        INSERT INTO @Results (org_name, org_db, account_profile_country, users_missing_country, users_missing_language)
        EXEC sp_executesql @SQL,
            N'@OrgName NVARCHAR(200), @OrgDb NVARCHAR(200)',
            @OrgName = @OrgName,
            @OrgDb   = @OrgDb;
    END TRY
    BEGIN CATCH
        INSERT INTO @Results (org_name, org_db, account_profile_country, users_missing_country, users_missing_language)
        VALUES (@OrgName, @OrgDb, N'ERROR: ' + ERROR_MESSAGE(), -1, -1);
    END CATCH;

    FETCH NEXT FROM org_cursor INTO @OrgName, @OrgDb;
END;

CLOSE org_cursor;
DEALLOCATE org_cursor;

SELECT
    org_name,
    org_db,
    account_profile_country,
    users_missing_country,
    users_missing_language,
    CASE
        WHEN account_profile_country LIKE 'ERROR:%' THEN 'ERROR'
        WHEN account_profile_country IS NULL        THEN 'NULL — users will not be backfilled'
        ELSE                                             'OK'
    END AS status
FROM @Results
ORDER BY (users_missing_country + users_missing_language) DESC, org_name;

SELECT
    COUNT(*)                                                                  AS total_orgs,
    SUM(CASE WHEN account_profile_country IS NOT NULL
              AND account_profile_country NOT LIKE 'ERROR:%' THEN 1 ELSE 0 END) AS orgs_with_country,
    SUM(CASE WHEN account_profile_country IS NULL THEN 1 ELSE 0 END)         AS orgs_missing_country,
    SUM(CASE WHEN account_profile_country LIKE 'ERROR:%' THEN 1 ELSE 0 END)  AS orgs_with_error
FROM @Results;
