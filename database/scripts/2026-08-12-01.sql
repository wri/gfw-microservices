-- [GPV-5495]
-- DB: Remove integrated_alerts_daily* columns from [Analyses-Dashboard] table
-- Run against [gfwpro]; iterates all clientstore databases.

USE [gfwpro]
GO

SET NOCOUNT ON;

-- Set to 1 to preview changes only (no ALTER statements executed).
-- Set to 0 to apply changes.
DECLARE @DryRun BIT = 1;

DECLARE @OrgDb NVARCHAR(200);
DECLARE @SQL   NVARCHAR(MAX);

DECLARE org_cursor CURSOR FOR
SELECT organization_db
FROM [gfwpro].[dbo].[Organizations]
WHERE organization_db IS NOT NULL
  AND LTRIM(RTRIM(organization_db)) <> N''
ORDER BY organization_db;

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgDb;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        RAISERROR(N'Processing: %s', 10, 1, @OrgDb) WITH NOWAIT;

        SET @SQL = N'
USE ' + QUOTENAME(@OrgDb) + N';

DECLARE @colName  NVARCHAR(128);
DECLARE @cname    NVARCHAR(128);
DECLARE @dropSQL  NVARCHAR(MAX) = N'''';

DECLARE col_cursor CURSOR FOR
SELECT col FROM (VALUES
    (N''integrated_alerts_daily_all_nominal''),
    (N''integrated_alerts_daily_all_high''),
    (N''integrated_alerts_daily_all_highest''),
    (N''integrated_alerts_daily_sbtn_nominal''),
    (N''integrated_alerts_daily_sbtn_high''),
    (N''integrated_alerts_daily_sbtn_highest''),
    (N''integrated_alerts_daily_jrc_nominal''),
    (N''integrated_alerts_daily_jrc_high''),
    (N''integrated_alerts_daily_jrc_highest'')
) AS t(col);

OPEN col_cursor;
FETCH NEXT FROM col_cursor INTO @colName;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(''[dbo].[Analyses-Dashboard]'')
          AND name = @colName
    )
    BEGIN
        SET @cname = NULL;
        SELECT @cname = dc.name
        FROM sys.default_constraints AS dc
        INNER JOIN sys.columns AS c ON c.default_object_id = dc.object_id
        WHERE c.name = @colName
          AND c.object_id = OBJECT_ID(''[dbo].[Analyses-Dashboard]'');

        IF @cname IS NOT NULL
            SET @dropSQL = @dropSQL + ''ALTER TABLE [dbo].[Analyses-Dashboard] DROP CONSTRAINT ['' + @cname + ''];'' + CHAR(10);

        SET @dropSQL = @dropSQL + ''ALTER TABLE [dbo].[Analyses-Dashboard] DROP COLUMN ['' + @colName + ''];'' + CHAR(10);
        PRINT ''  Queued drop: '' + @colName;
    END
    ELSE
        PRINT ''  Skipped (not found): '' + @colName;

    FETCH NEXT FROM col_cursor INTO @colName;
END

CLOSE col_cursor;
DEALLOCATE col_cursor;

IF LEN(@dropSQL) > 0
BEGIN
    IF @DryRun = 1
    BEGIN
        PRINT ''  DRY RUN: statements generated, not executed.'';
        PRINT @dropSQL;
    END
    ELSE
        EXEC sp_executesql @dropSQL;
END
';

        EXEC sp_executesql @SQL, N'@DryRun BIT', @DryRun = @DryRun;

    END TRY
    BEGIN CATCH
        PRINT 'ERROR in ' + @OrgDb + ': ' + ERROR_MESSAGE();
    END CATCH

    FETCH NEXT FROM org_cursor INTO @OrgDb;
END

CLOSE org_cursor;
DEALLOCATE org_cursor;
