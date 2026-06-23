-- [GPV-5346]
-- Create new user fields for email export and backfill defaults.

USE [gfwpro]
GO

SET NOCOUNT ON;

IF OBJECT_ID('tempdb..#CountryLanguageMap') IS NOT NULL
    DROP TABLE #CountryLanguageMap;

CREATE TABLE #CountryLanguageMap
(
    CountryName NVARCHAR(100) NOT NULL,
    LanguageCode NCHAR(2) NOT NULL
);

INSERT INTO #CountryLanguageMap (CountryName, LanguageCode)
VALUES
    (N'Afghanistan', N'EN'),
    (N'Albania', N'EN'),
    (N'Algeria', N'EN'),
    (N'Andorra', N'SP'),
    (N'Angola', N'PR'),
    (N'Antigua and Barbuda', N'EN'),
    (N'Argentina', N'SP'),
    (N'Armenia', N'EN'),
    (N'Australia', N'EN'),
    (N'Austria', N'EN'),
    (N'Azerbaijan', N'EN'),
    (N'Bahamas', N'EN'),
    (N'Bahrain', N'EN'),
    (N'Bangladesh', N'EN'),
    (N'Barbados', N'EN'),
    (N'Belarus', N'EN'),
    (N'Belgium', N'EN'),
    (N'Belize', N'EN'),
    (N'Benin', N'EN'),
    (N'Bhutan', N'EN'),
    (N'Bolivia', N'SP'),
    (N'Bosnia and Herzegovina', N'EN'),
    (N'Botswana', N'EN'),
    (N'Brazil', N'PR'),
    (N'Brunei', N'EN'),
    (N'Bulgaria', N'EN'),
    (N'Burkina Faso', N'EN'),
    (N'Burundi', N'EN'),
    (N'Cabo Verde', N'PR'),
    (N'Cambodia', N'EN'),
    (N'Cameroon', N'EN'),
    (N'Canada', N'EN'),
    (N'Central African Republic', N'EN'),
    (N'Chad', N'EN'),
    (N'Chile', N'SP'),
    (N'China', N'EN'),
    (N'Colombia', N'SP'),
    (N'Comoros', N'EN'),
    (N'Congo', N'EN'),
    (N'Costa Rica', N'SP'),
    (N'Croatia', N'EN'),
    (N'Cuba', N'SP'),
    (N'Cyprus', N'EN'),
    (N'Czech Republic', N'EN'),
    (N'Denmark', N'EN'),
    (N'Djibouti', N'EN'),
    (N'Dominica', N'EN'),
    (N'Dominican Republic', N'SP'),
    (N'Ecuador', N'SP'),
    (N'Egypt', N'EN'),
    (N'El Salvador', N'SP'),
    (N'Equatorial Guinea', N'SP'),
    (N'Eritrea', N'EN'),
    (N'Estonia', N'EN'),
    (N'Eswatini', N'EN'),
    (N'Ethiopia', N'EN'),
    (N'Fiji', N'EN'),
    (N'Finland', N'EN'),
    (N'France', N'EN'),
    (N'Gabon', N'EN'),
    (N'Gambia', N'EN'),
    (N'Georgia', N'EN'),
    (N'Germany', N'EN'),
    (N'Ghana', N'EN'),
    (N'Greece', N'EN'),
    (N'Grenada', N'EN'),
    (N'Guatemala', N'SP'),
    (N'Guinea', N'EN'),
    (N'Guinea-Bissau', N'PR'),
    (N'Guyana', N'EN'),
    (N'Haiti', N'EN'),
    (N'Honduras', N'SP'),
    (N'Hungary', N'EN'),
    (N'Iceland', N'EN'),
    (N'India', N'EN'),
    (N'Indonesia', N'EN'),
    (N'Iran', N'EN'),
    (N'Iraq', N'EN'),
    (N'Ireland', N'EN'),
    (N'Israel', N'EN'),
    (N'Italy', N'EN'),
    (N'Jamaica', N'EN'),
    (N'Japan', N'EN'),
    (N'Jordan', N'EN'),
    (N'Kazakhstan', N'EN'),
    (N'Kenya', N'EN'),
    (N'Kiribati', N'EN'),
    (N'Kuwait', N'EN'),
    (N'Kyrgyzstan', N'EN'),
    (N'Laos', N'EN'),
    (N'Latvia', N'EN'),
    (N'Lebanon', N'EN'),
    (N'Lesotho', N'EN'),
    (N'Liberia', N'EN'),
    (N'Libya', N'EN'),
    (N'Liechtenstein', N'EN'),
    (N'Lithuania', N'EN'),
    (N'Luxembourg', N'EN'),
    (N'Madagascar', N'EN'),
    (N'Malawi', N'EN'),
    (N'Malaysia', N'EN'),
    (N'Maldives', N'EN'),
    (N'Mali', N'EN'),
    (N'Malta', N'EN'),
    (N'Marshall Islands', N'EN'),
    (N'Mauritania', N'EN'),
    (N'Mauritius', N'EN'),
    (N'Mexico', N'SP'),
    (N'Micronesia', N'EN'),
    (N'Moldova', N'EN'),
    (N'Monaco', N'EN'),
    (N'Mongolia', N'EN'),
    (N'Montenegro', N'EN'),
    (N'Morocco', N'EN'),
    (N'Mozambique', N'PR'),
    (N'Myanmar', N'EN'),
    (N'Namibia', N'EN'),
    (N'Nauru', N'EN'),
    (N'Nepal', N'EN'),
    (N'Netherlands', N'EN'),
    (N'New Zealand', N'EN'),
    (N'Nicaragua', N'SP'),
    (N'Niger', N'EN'),
    (N'Nigeria', N'EN'),
    (N'North Korea', N'EN'),
    (N'North Macedonia', N'EN'),
    (N'Norway', N'EN'),
    (N'Oman', N'EN'),
    (N'Pakistan', N'EN'),
    (N'Palau', N'EN'),
    (N'Panama', N'SP'),
    (N'Papua New Guinea', N'EN'),
    (N'Paraguay', N'SP'),
    (N'Peru', N'SP'),
    (N'Philippines', N'EN'),
    (N'Poland', N'EN'),
    (N'Portugal', N'PR'),
    (N'Qatar', N'EN'),
    (N'Romania', N'EN'),
    (N'Russia', N'EN'),
    (N'Rwanda', N'EN'),
    (N'Saint Kitts and Nevis', N'EN'),
    (N'Saint Lucia', N'EN'),
    (N'Saint Vincent and the Grenadines', N'EN'),
    (N'Samoa', N'EN'),
    (N'San Marino', N'EN'),
    (N'Sao Tome and Principe', N'PR'),
    (N'Saudi Arabia', N'EN'),
    (N'Senegal', N'EN'),
    (N'Serbia', N'EN'),
    (N'Seychelles', N'EN'),
    (N'Sierra Leone', N'EN'),
    (N'Singapore', N'EN'),
    (N'Slovakia', N'EN'),
    (N'Slovenia', N'EN'),
    (N'Solomon Islands', N'EN'),
    (N'Somalia', N'EN'),
    (N'South Africa', N'EN'),
    (N'South Korea', N'EN'),
    (N'South Sudan', N'EN'),
    (N'Spain', N'SP'),
    (N'Sri Lanka', N'EN'),
    (N'Sudan', N'EN'),
    (N'Suriname', N'EN'),
    (N'Sweden', N'EN'),
    (N'Switzerland', N'EN'),
    (N'Syria', N'EN'),
    (N'Taiwan', N'EN'),
    (N'Tajikistan', N'EN'),
    (N'Tanzania', N'EN'),
    (N'Thailand', N'EN'),
    (N'Timor-Leste', N'PR'),
    (N'Togo', N'EN'),
    (N'Tonga', N'EN'),
    (N'Trinidad and Tobago', N'EN'),
    (N'Tunisia', N'EN'),
    (N'Turkey', N'EN'),
    (N'Turkmenistan', N'EN'),
    (N'Tuvalu', N'EN'),
    (N'Uganda', N'EN'),
    (N'Ukraine', N'EN'),
    (N'United Arab Emirates', N'EN'),
    (N'United Kingdom', N'EN'),
    (N'United States', N'EN'),
    (N'Uruguay', N'SP'),
    (N'Uzbekistan', N'EN'),
    (N'Vanuatu', N'EN'),
    (N'Vatican City', N'SP'),
    (N'Venezuela', N'SP'),
    (N'Vietnam', N'EN'),
    (N'Yemen', N'EN'),
    (N'Zambia', N'EN'),
    (N'Zimbabwe', N'EN');

IF NOT EXISTS (SELECT 1 FROM #CountryLanguageMap)
BEGIN
    -- Prevent continuing when the inline mapping is unexpectedly empty.
    RAISERROR('Country-language mapping loaded zero rows.', 16, 1);
    RETURN;
END;

DECLARE @OrgName NVARCHAR(200);
DECLARE @OrgDbName NVARCHAR(200);
DECLARE @SQL NVARCHAR(MAX);
DECLARE @SQL2 NVARCHAR(MAX);
DECLARE @OrgStartUtc DATETIME2(7);
DECLARE @OrgElapsedSeconds INT;
DECLARE @LogMessage NVARCHAR(4000);

DECLARE org_cursor CURSOR FOR
SELECT organization_name, organization_db
FROM gfwpro.dbo.Organizations
WHERE organization_status_id = 2
  AND organization_db IS NOT NULL
    AND LTRIM(RTRIM(organization_db)) <> N'';

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgName, @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
    SET @OrgStartUtc = SYSUTCDATETIME();
    SET @LogMessage = N'Started org: ' + @OrgName + N' (' + @OrgDbName + N') at ' + CONVERT(NVARCHAR(19), @OrgStartUtc, 120) + N' UTC';
    RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;

        -- Batch 1: add columns. Must be a separate sp_executesql call so SQL Server
        -- compiles Batch 2 only after the columns already exist in the schema.
        SET @SQL = N'
USE ' + QUOTENAME(@OrgDbName) + N';

IF COL_LENGTH(''dbo.Users'', ''deactivation_date'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [deactivation_date] SMALLDATETIME NULL;

IF COL_LENGTH(''dbo.Users'', ''country'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [country] NVARCHAR(100) NULL;

IF COL_LENGTH(''dbo.Users'', ''language'') IS NULL
    ALTER TABLE [dbo].[Users] ADD [language] NCHAR(2) NULL;
';

        EXEC sp_executesql @SQL;

        -- Batch 2: backfill data. Parsed after Batch 1 completes, so the new
        -- columns are visible to the query compiler.
        SET @SQL2 = N'
USE ' + QUOTENAME(@OrgDbName) + N';

DECLARE @BatchSize INT = 1000;
DECLARE @LastUserId INT = 0;
DECLARE @NextLastUserId INT;
DECLARE @RowsAffected INT;
DECLARE @BatchNo INT = 0;
DECLARE @TotalRowsAffected INT = 0;
DECLARE @BatchMessage NVARCHAR(400);

WHILE 1 = 1
BEGIN
    SELECT @NextLastUserId = MAX(src.id)
    FROM
    (
        SELECT TOP (@BatchSize) u.id
        FROM dbo.Users u
        WHERE u.is_system_user = 0
          AND u.id > @LastUserId
        ORDER BY u.id
    ) src;

    IF @NextLastUserId IS NULL
        BREAK;

    ;WITH OrgCountry AS
    (
        SELECT TOP (1)
            LastSegment =
                CASE
                    WHEN ap.organization_address IS NULL OR LTRIM(RTRIM(ap.organization_address)) = N'''' THEN NULL
                    WHEN CHARINDEX('','', ap.organization_address) > 0 THEN
                        NULLIF(LTRIM(RTRIM(RIGHT(ap.organization_address, CHARINDEX('','', REVERSE(ap.organization_address)) - 1))), N'''')
                    ELSE NULLIF(LTRIM(RTRIM(ap.organization_address)), N'''')
                END,
            PreviousSegment =
                CASE
                    WHEN ap.organization_address IS NULL OR LTRIM(RTRIM(ap.organization_address)) = N'''' THEN NULL
                    WHEN CHARINDEX('','', ap.organization_address) = 0 THEN NULL
                    ELSE
                        LTRIM(RTRIM(
                            CASE
                                WHEN CHARINDEX('','', REVERSE(LEFT(ap.organization_address, LEN(ap.organization_address) - CHARINDEX('','', REVERSE(ap.organization_address))))) > 0
                                    THEN RIGHT(
                                        LEFT(ap.organization_address, LEN(ap.organization_address) - CHARINDEX('','', REVERSE(ap.organization_address))),
                                        CHARINDEX('','', REVERSE(LEFT(ap.organization_address, LEN(ap.organization_address) - CHARINDEX('','', REVERSE(ap.organization_address))))) - 1
                                    )
                                ELSE LEFT(ap.organization_address, LEN(ap.organization_address) - CHARINDEX('','', REVERSE(ap.organization_address)))
                            END
                        ))
                END
        FROM dbo.AccountProfile ap
        ORDER BY ap.id DESC
    ),
    BatchUsers AS
    (
        SELECT TOP (@BatchSize) u.id
        FROM dbo.Users u
        WHERE u.is_system_user = 0
          AND u.id > @LastUserId
        ORDER BY u.id
    )
    UPDATE u
    SET
        -- Keep the existing country only when it is already a known valid country.
        -- If it is NULL, empty, or an unrecognised value (e.g. a street address),
        -- replace it with the candidate derived from the org address segments.
        [country] = CASE
            WHEN clmExisting.CountryName IS NOT NULL THEN u.[country]
            ELSE resolved.CandidateCountry
        END,
        -- Backfill language when empty: if country is valid, use that country''s map;
        -- otherwise use the resolved candidate country map; default to EN when needed.
        [language] = CASE
            WHEN NULLIF(LTRIM(RTRIM(u.[language])), N'''') IS NOT NULL THEN u.[language]
            WHEN clmExisting.CountryName IS NOT NULL THEN COALESCE(clmExisting.LanguageCode, N''EN'')
            ELSE COALESCE(clm.LanguageCode, N''EN'')
        END
    FROM dbo.Users u
    INNER JOIN BatchUsers bu ON bu.id = u.id
    CROSS JOIN OrgCountry oc
    -- Validate the currently stored country value against the known country map.
    -- CI_AI (Case Insensitive and Accent Insensitive) collation ensures matching is case- and accent-insensitive regardless
    -- of the org database''s own collation setting.
    LEFT JOIN #CountryLanguageMap clmExisting ON clmExisting.CountryName = NULLIF(LTRIM(RTRIM(u.[country])), N'''') COLLATE Latin1_General_CI_AI
    LEFT JOIN #CountryLanguageMap clmLast ON clmLast.CountryName = oc.LastSegment COLLATE Latin1_General_CI_AI
    LEFT JOIN #CountryLanguageMap clmPrev ON clmPrev.CountryName = oc.PreviousSegment COLLATE Latin1_General_CI_AI
    CROSS APPLY
    (
        -- Only use a segment as the country value when it actually matches a known
        -- country in the map. If neither segment matches, leave the country as NULL
        -- rather than storing a street address or postal code.
        SELECT CandidateCountry =
            CASE
                WHEN clmLast.CountryName IS NOT NULL THEN oc.LastSegment
                WHEN clmPrev.CountryName IS NOT NULL THEN oc.PreviousSegment
                ELSE NULL
            END
    ) resolved
    LEFT JOIN #CountryLanguageMap clm ON clm.CountryName = resolved.CandidateCountry COLLATE Latin1_General_CI_AI;

    SET @RowsAffected = @@ROWCOUNT;
    SET @BatchNo = @BatchNo + 1;
    SET @TotalRowsAffected = @TotalRowsAffected + @RowsAffected;

    SET @BatchMessage = N''  Batch '' + CAST(@BatchNo AS NVARCHAR(20))
        + N'': users.id <= '' + CAST(@NextLastUserId AS NVARCHAR(20))
        + N'', rows affected = '' + CAST(@RowsAffected AS NVARCHAR(20));
    RAISERROR(N''%s'', 10, 1, @BatchMessage) WITH NOWAIT;

    SET @LastUserId = @NextLastUserId;
END;

SET @BatchMessage = N''  Total rows affected in org = '' + CAST(@TotalRowsAffected AS NVARCHAR(20));
RAISERROR(N''%s'', 10, 1, @BatchMessage) WITH NOWAIT;
';

        EXEC sp_executesql @SQL2;

        SET @OrgElapsedSeconds = CASE
            WHEN DATEDIFF(SECOND, @OrgStartUtc, SYSUTCDATETIME()) < 0 THEN 0
            ELSE DATEDIFF(SECOND, @OrgStartUtc, SYSUTCDATETIME())
        END;
        SET @LogMessage = N'Updated user table for org: ' + @OrgName + N' (' + @OrgDbName + N')';
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;
        SET @LogMessage = N'Elapsed for org: ' + CAST(@OrgElapsedSeconds AS NVARCHAR(20)) + N' sec ('
            + CAST(CAST(@OrgElapsedSeconds / 60.0 AS DECIMAL(10,2)) AS NVARCHAR(20)) + N' min)';
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;
    END TRY
    BEGIN CATCH
        SET @LogMessage = N'ERROR updating organization: ' + @OrgName + N' (' + ISNULL(@OrgDbName, N'NULL') + N')';
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;
        SET @LogMessage = N'Error: ' + ERROR_MESSAGE();
        RAISERROR(N'%s', 10, 1, @LogMessage) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM org_cursor INTO @OrgName, @OrgDbName;
END

CLOSE org_cursor;
DEALLOCATE org_cursor;

RAISERROR(N'========================================', 10, 1) WITH NOWAIT;
RAISERROR(N'GPV-5346 migration completed', 10, 1) WITH NOWAIT;
RAISERROR(N'========================================', 10, 1) WITH NOWAIT;