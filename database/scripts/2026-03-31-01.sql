-- GPV-5156: Disable Weekly Alerts Analysis for all lists
-- Purpose: Set options = NULL for all ALERTS analysis to disable automatic weekly updates
-- Date: 2026-03-31
-- Target: All clientstore databases (including inactive orgs and internal test orgs)

USE [gfwpro]
GO

SET NOCOUNT ON;

-- ========================================
-- STEP 1: CREATE BACKUP TABLE
-- ========================================

-- Create backup table to track all changes
IF OBJECT_ID('tempdb..#WeeklyAlertsBackup') IS NOT NULL 
    DROP TABLE #WeeklyAlertsBackup;

CREATE TABLE #WeeklyAlertsBackup (
    org_database NVARCHAR(128),
    list_id INT,
    analysis_id VARCHAR(30),
    options_before NVARCHAR(32),
    backup_timestamp DATETIME2
);


PRINT '✓ Backup table created';
PRINT '';


-- ========================================
-- STEP 2: PROCESS ALL DATABASES
-- ========================================

-- Declare variables for the loop
DECLARE @OrgDbName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);
DECLARE @RowCount INT;
DECLARE @TotalProcessed INT = 0;
DECLARE @TotalUpdated INT = 0;
DECLARE @DbCount INT = 0;
DECLARE @RowCountTable TABLE (RowCount INT);

-- Count total databases first (for progress reporting)
SELECT @DbCount = COUNT(*) 
FROM [gfwpro].[dbo].[Organizations]
WHERE [organization_db] IS NOT NULL;

PRINT 'Starting process for ' + CAST(@DbCount AS VARCHAR(10)) + ' organization databases...';
PRINT '';

-- Cursor to iterate through ALL organization databases
DECLARE orgdb_cursor CURSOR FOR
SELECT [organization_db] 
FROM [gfwpro].[dbo].[Organizations]
WHERE [organization_db] IS NOT NULL
ORDER BY [organization_db];

OPEN orgdb_cursor;
FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @TotalProcessed = @TotalProcessed + 1;
    
    BEGIN TRY
        -- Dynamic SQL for each database
        SET @SQL = N'
        USE ' + QUOTENAME(@OrgDbName) + N';
        
        -- First, backup current state
        INSERT INTO tempdb..#WeeklyAlertsBackup (org_database, list_id, analysis_id, options_before, backup_timestamp)
        SELECT 
            ''' + REPLACE(@OrgDbName, '''', '''''') + N''',
            ListID,
            AnalysisID,
            [options],
            GETDATE()
        FROM [dbo].[ListsAnalysisStatus]
        WHERE AnalysisID = ''ALERTS'' 
          AND [options] = ''Weekly'';
        
        -- Then, perform the update
        UPDATE [dbo].[ListsAnalysisStatus]
        SET [options] = NULL
        WHERE AnalysisID = ''ALERTS''
          AND [options] = ''Weekly'';
        
        SELECT @@ROWCOUNT;
        ';
        
        -- Execute and capture row count using table variable
        DELETE FROM @RowCountTable;
        
        INSERT INTO @RowCountTable
        EXEC sp_executesql @SQL;
        
        SELECT @RowCount = RowCount FROM @RowCountTable;
        
        SET @TotalUpdated = @TotalUpdated + @RowCount;
        
        -- Print progress (only for databases with updates)
        IF @RowCount > 0
        BEGIN
            PRINT '[' + CAST(@TotalProcessed AS VARCHAR(5)) + '/' + CAST(@DbCount AS VARCHAR(5)) + '] ' 
                  + @OrgDbName + ': Updated ' + CAST(@RowCount AS VARCHAR(10)) + ' list(s)';
        END
        
    END TRY
    BEGIN CATCH
        PRINT 'ERROR processing ' + @OrgDbName + ': ' + ERROR_MESSAGE();
    END CATCH
    
    FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;
END;

CLOSE orgdb_cursor;
DEALLOCATE orgdb_cursor;

PRINT '';
PRINT '========================================';
PRINT 'MIGRATION COMPLETE';
PRINT '========================================';
PRINT 'Total databases processed: ' + CAST(@TotalProcessed AS VARCHAR(10));
PRINT 'Total lists updated: ' + CAST(@TotalUpdated AS VARCHAR(10));
PRINT '';

-- ========================================
-- STEP 3: REVIEW BACKUP DATA
-- ========================================

PRINT 'Displaying backup of all changed records:';
PRINT '';

-- Show all records that were updated
SELECT 
    org_database,
    list_id,
    analysis_id,
    options_before,
    backup_timestamp
FROM #WeeklyAlertsBackup
ORDER BY org_database, list_id;

PRINT '';
PRINT 'Review complete. Backup data shown above.';
PRINT 'Note: Backup data is in temp table and will be lost when session ends.';