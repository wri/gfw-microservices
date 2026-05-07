/*========================================================================================
  -- GPV-4936 Repair
  Add missing GHGAnalyses columns to existing org databases that were created
  before activatePendingAccount.ts was updated to include the new columns.

  Columns added: emissions_co2_yearly, emissions_ch4_yearly, emissions_n2o_yearly,
                 emissions_yearly, production, weighted_avg_yield
========================================================================================*/

DECLARE @OrgDbName  NVARCHAR(128);
DECLARE @SQL        NVARCHAR(MAX);
DECLARE @UpdatedCount INT = 0;

DECLARE orgdb_cursor CURSOR FOR
    SELECT [organization_db]
    FROM [gfwpro].[dbo].[Organizations]
    WHERE [organization_status_id] = 2
    ORDER BY [id];

OPEN orgdb_cursor;
FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF DB_ID(@OrgDbName) IS NOT NULL
    BEGIN
        DECLARE @WasUpdated BIT = 0;

        SET @SQL = N'
        USE ' + QUOTENAME(@OrgDbName) + N';

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = ''dbo'' AND TABLE_NAME = ''GHGAnalyses''
        )
        BEGIN
            DECLARE @changed BIT = 0;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''emissions_co2_yearly'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [emissions_co2_yearly] NVARCHAR(MAX) NULL; SET @changed = 1; END;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''emissions_ch4_yearly'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [emissions_ch4_yearly] NVARCHAR(MAX) NULL; SET @changed = 1; END;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''emissions_n2o_yearly'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [emissions_n2o_yearly] NVARCHAR(MAX) NULL; SET @changed = 1; END;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''emissions_yearly'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [emissions_yearly] NVARCHAR(MAX) NULL; SET @changed = 1; END;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''production'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [production] FLOAT NULL; SET @changed = 1; END;

            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''GHGAnalyses'' AND COLUMN_NAME = ''weighted_avg_yield'')
            BEGIN ALTER TABLE [dbo].[GHGAnalyses] ADD [weighted_avg_yield] FLOAT NULL; SET @changed = 1; END;

            SELECT @WasUpdatedOUT = @changed;
        END;
        ';

        EXEC sp_executesql @SQL, N'@WasUpdatedOUT BIT OUTPUT', @WasUpdatedOUT = @WasUpdated OUTPUT;

        IF @WasUpdated = 1
            SET @UpdatedCount = @UpdatedCount + 1;
    END;

    FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;
END;

CLOSE orgdb_cursor;
DEALLOCATE orgdb_cursor;

PRINT 'Done. Org databases updated: ' + CAST(@UpdatedCount AS NVARCHAR(10));
