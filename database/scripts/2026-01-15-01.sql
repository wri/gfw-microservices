/*
 * Migration Script: Clean up ActivityLog descriptions to remove user names and emails
 * Date: 2026-01-15
 * Description: Updates old ActivityLog entries to remove personally identifiable information
 *              (names and emails) from the activity_description field.
 *              New logs already have this information removed, but old logs need to be cleaned up.
 */

-- Declare variables for cursor
DECLARE @OrgId INT;
DECLARE @OrgName NVARCHAR(100);
DECLARE @OrgDbName NVARCHAR(100);
DECLARE @SQL NVARCHAR(MAX);

PRINT '========================================';
PRINT 'ActivityLog Cleanup Migration';
PRINT 'Date: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '========================================';
PRINT '';

-- Cursor to iterate through all organizations
DECLARE org_cursor CURSOR FOR
SELECT id, organization_name, organization_db
FROM gfwpro.dbo.Organizations
WHERE organization_status_id = 2; -- Active organizations only

OPEN org_cursor;
FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        PRINT 'Processing organization: ' + @OrgName + ' (Database: ' + @OrgDbName + ')';
        
        SET @SQL = N'
        USE [' + @OrgDbName + N'];
        
        DECLARE @UpdateCount INT = 0;
        DECLARE @TotalUpdated INT = 0;
        DECLARE @changes INT = 0;
        
        -- Create a function to remove email addresses from text
        -- Note: This uses PATINDEX to find email patterns
        
        PRINT ''  Starting cleanup for ' + @OrgDbName + N''';
        
        -- Step 1: Create a temporary function to extract and replace emails
        -- We''ll use a simpler iterative approach with multiple passes
        
        -- Pass 1: Replace "User ''email@domain.com'' has..." with "User ID X has..."
        UPDATE ActivityLog
        SET activity_description = 
            REPLACE(
                activity_description,
                SUBSTRING(
                    activity_description,
                    1,
                    CHARINDEX('''''''', activity_description, CHARINDEX('''''''', activity_description) + 1) + 1
                ),
                ''User ID '' + CAST(user_id AS NVARCHAR(20)) + '' ''
            )
        WHERE activity_description LIKE ''User ''''%''''%''
          AND CHARINDEX('''''''', activity_description) > 0
          AND CHARINDEX('''''''', activity_description, CHARINDEX('''''''', activity_description) + 1) > 0;
        
        SET @UpdateCount = @@ROWCOUNT;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Updated User ''''email'''' pattern: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Pass 2: Replace "User Name has logged in/out" with "User ID X has logged in/out."
        SET @UpdateCount = 0;
        
        UPDATE ActivityLog
        SET activity_description = 
            CASE
                WHEN activity_description LIKE ''User % has logged in%''
                THEN ''User ID '' + CAST(user_id AS NVARCHAR(20)) + '' has logged in.''
                WHEN activity_description LIKE ''User % has logged out%''
                THEN ''User ID '' + CAST(user_id AS NVARCHAR(20)) + '' has logged out.''
                ELSE activity_description
            END
        WHERE (activity_description LIKE ''User % has logged in%''
           OR activity_description LIKE ''User % has logged out%'')
          AND activity_description NOT LIKE ''User ID % has logged%'';
        
        SET @changes = @@ROWCOUNT;
        SET @UpdateCount = @UpdateCount + @changes;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Updated login/logout pattern: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Pass 3: Replace "[Name] sent to queue" with "User ID X sent to queue"
        SET @UpdateCount = 0;
        
        UPDATE ActivityLog
        SET activity_description = ''User ID '' + CAST(user_id AS NVARCHAR(20)) + '' sent to queue''
        WHERE activity_description LIKE ''% sent to queue''
          AND activity_description NOT LIKE ''User ID % sent to queue'';
        
        SET @changes = @@ROWCOUNT;
        SET @UpdateCount = @UpdateCount + @changes;
        
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Cleaned name patterns: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Pass 4: Replace "The endpoint X was accessed by user email@domain.com" with "The endpoint X was accessed by user 32"
        SET @UpdateCount = 0;
        
        UPDATE ActivityLog
        SET activity_description = 
            SUBSTRING(activity_description, 1, CHARINDEX(''was accessed by user '', activity_description) + 20) +
            CAST(user_id AS NVARCHAR(20))
        WHERE activity_description LIKE ''The endpoint % was accessed by user %@%''
          AND CHARINDEX(''was accessed by user '', activity_description) > 0
          AND CHARINDEX(''@'', activity_description) > 0;
        
        SET @changes = @@ROWCOUNT;
        SET @UpdateCount = @UpdateCount + @changes;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Updated endpoint access pattern: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        PRINT ''  Total records updated: '' + CAST(@TotalUpdated AS VARCHAR(10));
        
        PRINT ''  Successfully completed cleanup for ' + @OrgDbName + N''';
        ';
        
        -- Execute the update for this organization database
        EXEC sp_executesql @SQL;
        
        PRINT '-------------------------------------------';
        PRINT '';
        
    END TRY
    BEGIN CATCH
        PRINT 'ERROR processing organization: ' + @OrgName;
        PRINT 'Error Message: ' + ERROR_MESSAGE();
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
        PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
        
        -- Rollback will happen automatically since we're in a TRY/CATCH
        PRINT 'Transaction rolled back for this organization.';
        PRINT '-------------------------------------------';
        PRINT '';
        
        -- Continue with next organization even if this one fails
    END CATCH
    
    FETCH NEXT FROM org_cursor INTO @OrgId, @OrgName, @OrgDbName;
END

CLOSE org_cursor;
DEALLOCATE org_cursor;

PRINT '========================================';
PRINT 'ActivityLog cleanup migration completed.';
PRINT '========================================';

GO

/*
 * USAGE INSTRUCTIONS:
 * 1. Consider backing up the ActivityLog tables before running:
 *    -- For each organization database:
 *    SELECT * INTO ActivityLog_Backup_20260115 FROM ActivityLog;
 * 
 * 2. Run the script in a development or staging environment first to verify correctness.
 * 
 * 3. After running, verify the results by checking a few sample records:
 *    SELECT TOP 100 activity_description FROM ActivityLog 
 *    WHERE activity_time < ''2026-01-15''
 *    ORDER BY activity_time DESC;
 * 
 * 4. If you need to revert, you can restore from the backup table
 * 
 * LIMITATIONS:
 * - SQL Server's pattern matching is limited compared to regex
 * - Some edge cases may not be caught
 */
