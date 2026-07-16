-- [GPV-5346] Follow-up backfill: populate Users.country and Users.language
-- from AccountProfile.country (the dedicated column added in GPV-5466) for
-- any users where those fields are still NULL or empty.
--
-- Safe to re-run — only updates rows where country/language are missing.
-- Runs as a single set-based UPDATE per org (no row-by-row cursor on users).

USE [gfwpro]
GO

SET NOCOUNT ON;

-- Country → language mapping (identical to 2026-06-08-01.sql)
IF OBJECT_ID('tempdb..#CountryLanguageMap') IS NOT NULL
    DROP TABLE #CountryLanguageMap;

CREATE TABLE #CountryLanguageMap
(
    CountryName  NVARCHAR(100) NOT NULL,
    LanguageCode NCHAR(2)      NOT NULL
);

INSERT INTO #CountryLanguageMap (CountryName, LanguageCode)
VALUES
    (N'Afghanistan', N'EN'), (N'Albania', N'EN'), (N'Algeria', N'EN'),
    (N'Andorra', N'ES'), (N'Angola', N'PT'), (N'Antigua and Barbuda', N'EN'),
    (N'Argentina', N'ES'), (N'Armenia', N'EN'), (N'Australia', N'EN'),
    (N'Austria', N'EN'), (N'Azerbaijan', N'EN'), (N'Bahamas', N'EN'),
    (N'Bahrain', N'EN'), (N'Bangladesh', N'EN'), (N'Barbados', N'EN'),
    (N'Belarus', N'EN'), (N'Belgium', N'EN'), (N'Belize', N'EN'),
    (N'Benin', N'EN'), (N'Bhutan', N'EN'), (N'Bolivia', N'ES'),
    (N'Bosnia and Herzegovina', N'EN'), (N'Botswana', N'EN'), (N'Brazil', N'PT'),
    (N'Brunei', N'EN'), (N'Bulgaria', N'EN'), (N'Burkina Faso', N'EN'),
    (N'Burundi', N'EN'), (N'Cabo Verde', N'PT'), (N'Cambodia', N'EN'),
    (N'Cameroon', N'EN'), (N'Canada', N'EN'), (N'Central African Republic', N'EN'),
    (N'Chad', N'EN'), (N'Chile', N'ES'), (N'China', N'EN'),
    (N'Colombia', N'ES'), (N'Comoros', N'EN'), (N'Congo', N'EN'),
    (N'Costa Rica', N'ES'), (N'Croatia', N'EN'), (N'Cuba', N'ES'),
    (N'Cyprus', N'EN'), (N'Czech Republic', N'EN'), (N'Denmark', N'EN'),
    (N'Djibouti', N'EN'), (N'Dominica', N'EN'), (N'Dominican Republic', N'ES'),
    (N'Ecuador', N'ES'), (N'Egypt', N'EN'), (N'El Salvador', N'ES'),
    (N'Equatorial Guinea', N'ES'), (N'Eritrea', N'EN'), (N'Estonia', N'EN'),
    (N'Eswatini', N'EN'), (N'Ethiopia', N'EN'), (N'Fiji', N'EN'),
    (N'Finland', N'EN'), (N'France', N'EN'), (N'Gabon', N'EN'),
    (N'Gambia', N'EN'), (N'Georgia', N'EN'), (N'Germany', N'EN'),
    (N'Ghana', N'EN'), (N'Greece', N'EN'), (N'Grenada', N'EN'),
    (N'Guatemala', N'ES'), (N'Guinea', N'EN'), (N'Guinea-Bissau', N'PT'),
    (N'Guyana', N'EN'), (N'Haiti', N'EN'), (N'Honduras', N'ES'),
    (N'Hungary', N'EN'), (N'Iceland', N'EN'), (N'India', N'EN'),
    (N'Indonesia', N'EN'), (N'Iran', N'EN'), (N'Iraq', N'EN'),
    (N'Ireland', N'EN'), (N'Israel', N'EN'), (N'Italy', N'EN'),
    (N'Jamaica', N'EN'), (N'Japan', N'EN'), (N'Jordan', N'EN'),
    (N'Kazakhstan', N'EN'), (N'Kenya', N'EN'), (N'Kiribati', N'EN'),
    (N'Kuwait', N'EN'), (N'Kyrgyzstan', N'EN'), (N'Laos', N'EN'),
    (N'Latvia', N'EN'), (N'Lebanon', N'EN'), (N'Lesotho', N'EN'),
    (N'Liberia', N'EN'), (N'Libya', N'EN'), (N'Liechtenstein', N'EN'),
    (N'Lithuania', N'EN'), (N'Luxembourg', N'EN'), (N'Madagascar', N'EN'),
    (N'Malawi', N'EN'), (N'Malaysia', N'EN'), (N'Maldives', N'EN'),
    (N'Mali', N'EN'), (N'Malta', N'EN'), (N'Marshall Islands', N'EN'),
    (N'Mauritania', N'EN'), (N'Mauritius', N'EN'), (N'Mexico', N'ES'),
    (N'Micronesia', N'EN'), (N'Moldova', N'EN'), (N'Monaco', N'EN'),
    (N'Mongolia', N'EN'), (N'Montenegro', N'EN'), (N'Morocco', N'EN'),
    (N'Mozambique', N'PT'), (N'Myanmar', N'EN'), (N'Namibia', N'EN'),
    (N'Nauru', N'EN'), (N'Nepal', N'EN'), (N'Netherlands', N'EN'),
    (N'New Zealand', N'EN'), (N'Nicaragua', N'ES'), (N'Niger', N'EN'),
    (N'Nigeria', N'EN'), (N'North Korea', N'EN'), (N'North Macedonia', N'EN'),
    (N'Norway', N'EN'), (N'Oman', N'EN'), (N'Pakistan', N'EN'),
    (N'Palau', N'EN'), (N'Panama', N'ES'), (N'Papua New Guinea', N'EN'),
    (N'Paraguay', N'ES'), (N'Peru', N'ES'), (N'Philippines', N'EN'),
    (N'Poland', N'EN'), (N'Portugal', N'PT'), (N'Qatar', N'EN'),
    (N'Romania', N'EN'), (N'Russia', N'EN'), (N'Rwanda', N'EN'),
    (N'Saint Kitts and Nevis', N'EN'), (N'Saint Lucia', N'EN'),
    (N'Saint Vincent and the Grenadines', N'EN'), (N'Samoa', N'EN'),
    (N'San Marino', N'EN'), (N'Sao Tome and Principe', N'PT'),
    (N'Saudi Arabia', N'EN'), (N'Senegal', N'EN'), (N'Serbia', N'EN'),
    (N'Seychelles', N'EN'), (N'Sierra Leone', N'EN'), (N'Singapore', N'EN'),
    (N'Slovakia', N'EN'), (N'Slovenia', N'EN'), (N'Solomon Islands', N'EN'),
    (N'Somalia', N'EN'), (N'South Africa', N'EN'), (N'South Korea', N'EN'),
    (N'South Sudan', N'EN'), (N'Spain', N'ES'), (N'Sri Lanka', N'EN'),
    (N'Sudan', N'EN'), (N'Suriname', N'EN'), (N'Sweden', N'EN'),
    (N'Switzerland', N'EN'), (N'Syria', N'EN'), (N'Taiwan', N'EN'),
    (N'Tajikistan', N'EN'), (N'Tanzania', N'EN'), (N'Thailand', N'EN'),
    (N'Timor-Leste', N'PT'), (N'Togo', N'EN'), (N'Tonga', N'EN'),
    (N'Trinidad and Tobago', N'EN'), (N'Tunisia', N'EN'), (N'Turkey', N'EN'),
    (N'Turkmenistan', N'EN'), (N'Tuvalu', N'EN'), (N'Uganda', N'EN'),
    (N'Ukraine', N'EN'), (N'United Arab Emirates', N'EN'),
    (N'United Kingdom', N'EN'), (N'United States', N'EN'), (N'Uruguay', N'ES'),
    (N'Uzbekistan', N'EN'), (N'Vanuatu', N'EN'), (N'Vatican City', N'ES'),
    (N'Venezuela', N'ES'), (N'Vietnam', N'EN'), (N'Yemen', N'EN'),
    (N'Zambia', N'EN'), (N'Zimbabwe', N'EN');

DECLARE @OrgName   NVARCHAR(200);
DECLARE @OrgDb     NVARCHAR(200);
DECLARE @SQL       NVARCHAR(MAX);
DECLARE @LogMessage NVARCHAR(4000);

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
        SET @LogMessage = N'Processing org: ' + @OrgName + N' (' + @OrgDb + N')';
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;

        -- Batch 1: ensure columns exist (compiled before Batch 2 references them).
        SET @SQL = N'
USE ' + QUOTENAME(@OrgDb) + N';

IF COL_LENGTH(''dbo.Users'', ''deactivation_date'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [deactivation_date] SMALLDATETIME NULL;

IF COL_LENGTH(''dbo.Users'', ''country'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [country] NVARCHAR(100) NULL;

IF COL_LENGTH(''dbo.Users'', ''language'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [language] NCHAR(2) NULL;
';
        EXEC sp_executesql @SQL;

        -- Batch 2: backfill from AccountProfile.country.
        -- Sets country from AccountProfile.country where still missing,
        -- and derives language from the country map where still missing.
        SET @SQL = N'
USE ' + QUOTENAME(@OrgDb) + N';

UPDATE u
SET
    country  = CASE
                   WHEN NULLIF(LTRIM(RTRIM(u.country)), N'''') IS NOT NULL
                    AND UPPER(LTRIM(RTRIM(u.country))) <> N''NULL'' THEN u.country
                   ELSE NULLIF(LTRIM(RTRIM(ap.country)), N'''')
               END,
    language = CASE
                   WHEN NULLIF(LTRIM(RTRIM(u.language)), N'''') IS NOT NULL
                    AND UPPER(LTRIM(RTRIM(u.language))) <> N''NULL''
                    AND u.language NOT IN (N''SP'', N''PR'') THEN u.language
                   ELSE clm.LanguageCode
               END
FROM dbo.Users u
CROSS JOIN (SELECT TOP (1) country FROM dbo.AccountProfile ORDER BY id DESC) ap
LEFT JOIN #CountryLanguageMap clm
       ON clm.CountryName = NULLIF(LTRIM(RTRIM(ap.country)), N'''') COLLATE Latin1_General_CI_AI
WHERE
        NULLIF(LTRIM(RTRIM(u.country)),  N'''') IS NULL OR UPPER(LTRIM(RTRIM(u.country)))  = N''NULL''
     OR NULLIF(LTRIM(RTRIM(u.language)), N'''') IS NULL OR UPPER(LTRIM(RTRIM(u.language))) = N''NULL''
     OR u.language = N''SP'' OR u.language = N''PR'';

DECLARE @rows INT = @@ROWCOUNT;
DECLARE @msg  NVARCHAR(200) = N''  Rows updated: '' + CAST(@rows AS NVARCHAR(20));
RAISERROR(N''%s'', 10, 1, @msg) WITH NOWAIT;
';
        EXEC sp_executesql @SQL;

    END TRY
    BEGIN CATCH
        SET @LogMessage = N'ERROR on org: ' + @OrgName + N' — ' + ERROR_MESSAGE();
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM org_cursor INTO @OrgName, @OrgDb;
END;

CLOSE org_cursor;
DEALLOCATE org_cursor;

IF OBJECT_ID('tempdb..#CountryLanguageMap') IS NOT NULL
    DROP TABLE #CountryLanguageMap;

RAISERROR(N'========================================', 10, 1) WITH NOWAIT;
RAISERROR(N'2026-07-16-01 migration completed', 10, 1) WITH NOWAIT;
RAISERROR(N'========================================', 10, 1) WITH NOWAIT;
