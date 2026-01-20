/*
 * Migration Script: Clean up ActivityLog descriptions to remove user names and emails
 * Date: 2026-01-15
 * Description: Updates old ActivityLog entries to remove personally identifiable information
 *              (names and emails) from the activity_description field.
 *              New logs already have this information removed, but old logs need to be cleaned up.
 * 
 * IMPORTANT: Run 2026-01-15-02-analyze-activitylog-pii.sql first to understand the data patterns
 *            before executing this cleanup script.
 */

-- Declare variables for cursor
DECLARE @OrgId INT;
DECLARE @OrgName NVARCHAR(100);
DECLARE @OrgDbName NVARCHAR(100);
DECLARE @SQL NVARCHAR(MAX);

PRINT '========================================';
PRINT 'ActivityLog PII Cleanup Migration';
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
        
        BEGIN TRANSACTION;
        
        DECLARE @UpdateCount INT = 0;
        DECLARE @TotalUpdated INT = 0;
        
        -- Create a function to remove email addresses from text
        -- Note: This uses PATINDEX to find email patterns
        
        PRINT ''  Starting cleanup for ' + @OrgDbName + N''';
        
        -- Step 1: Remove email addresses using pattern matching
        -- Pattern: word@word.word (basic email pattern)
        UPDATE ActivityLog
        SET activity_description = 
            -- Replace email-like patterns with [email redacted]
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(activity_description, 
                            SUBSTRING(
                                activity_description,
                                PATINDEX(''%[A-Za-z0-9]%@%[A-Za-z0-9]%.%[A-Za-z0-9]%'', activity_description),
                                CASE 
                                    WHEN PATINDEX(''%[A-Za-z0-9]%@%[A-Za-z0-9]%.%[A-Za-z0-9]%'', activity_description) > 0
                                    THEN LEN(activity_description) - PATINDEX(''%[A-Za-z0-9]%@%[A-Za-z0-9]%.%[A-Za-z0-9]%'', activity_description)
                                    ELSE 0
                                END
                            ),
                            ''[email redacted]''
                        ),
                        ''  '', '' ''
                    ),
                    ''( [email redacted] )'', ''''
                ),
                ''([email redacted])'', ''''
            ),
            ''  '', '' ''
        WHERE activity_description LIKE ''%@%''
          AND activity_description LIKE ''%.%'';
        
        SET @UpdateCount = @@ROWCOUNT;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Cleaned email patterns: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Step 2: Remove common PII patterns with names
        -- Pattern: "shared with John Doe (email)" or "shared by John Doe"
        -- Pattern: "User ''name''" patterns
        UPDATE ActivityLog
        SET activity_description = 
            CASE
                -- Remove "shared with NAME" patterns
                WHEN activity_description LIKE ''%shared with %'' AND activity_description LIKE ''%@%''
                THEN LEFT(activity_description, CHARINDEX(''shared with '', activity_description) + 11) + ''[user]'' +
                     CASE 
                         WHEN CHARINDEX(''.'', activity_description, CHARINDEX(''shared with '', activity_description)) > 0
                         THEN SUBSTRING(activity_description, 
                              CHARINDEX(''.'', activity_description, CHARINDEX(''shared with '', activity_description)),
                              LEN(activity_description))
                         ELSE ''''
                     END
                     
                -- Remove "shared by NAME" patterns
                WHEN activity_description LIKE ''%shared by %'' AND activity_description LIKE ''%@%''
                THEN LEFT(activity_description, CHARINDEX(''shared by '', activity_description) + 9) + ''[user]'' +
                     CASE 
                         WHEN CHARINDEX(''.'', activity_description, CHARINDEX(''shared by '', activity_description)) > 0
                         THEN SUBSTRING(activity_description, 
                              CHARINDEX(''.'', activity_description, CHARINDEX(''shared by '', activity_description)),
                              LEN(activity_description))
                         ELSE ''''
                     END
                     
                ELSE activity_description
            END
        WHERE (activity_description LIKE ''%shared with %'' OR activity_description LIKE ''%shared by %'')
          AND activity_description LIKE ''%@%'';
        
        SET @UpdateCount = @@ROWCOUNT;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Cleaned sharing patterns: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Step 3: Clean up any remaining email patterns in parentheses
        -- Pattern: (email@domain.com)
        UPDATE ActivityLog
        SET activity_description = REPLACE(
            activity_description,
            SUBSTRING(
                activity_description,
                CHARINDEX(''('', activity_description),
                CHARINDEX('')'', activity_description) - CHARINDEX(''('', activity_description) + 1
            ),
            ''''
        )
        WHERE activity_description LIKE ''%(%@%.%)%''
          AND CHARINDEX(''('', activity_description) > 0
          AND CHARINDEX('')'', activity_description) > CHARINDEX(''('', activity_description);
        
        SET @UpdateCount = @@ROWCOUNT;
        SET @TotalUpdated = @TotalUpdated + @UpdateCount;
        PRINT ''  - Cleaned parenthetical emails: '' + CAST(@UpdateCount AS VARCHAR(10)) + '' records'';
        
        -- Step 4: Clean up multiple spaces that may have been created
        UPDATE ActivityLog
        SET activity_description = REPLACE(REPLACE(REPLACE(activity_description, ''  '', '' ''), ''  '', '' ''), ''  '', '' '')
        WHERE activity_description LIKE ''%  %'';
        
        PRINT ''  - Normalized whitespace'';
        
        PRINT ''  Total records updated: '' + CAST(@TotalUpdated AS VARCHAR(10));
        
        COMMIT TRANSACTION;
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
 * 
 * 1. Run the analysis script first (2026-01-15-02-analyze-activitylog-pii.sql) to see
 *    what data will be affected
 * 
 * 2. Test this script on a development or staging environment first
 * 
 * 3. Consider backing up the ActivityLog tables before running:
 *    -- For each organization database:
 *    SELECT * INTO ActivityLog_Backup_20260115 FROM ActivityLog;
 * 
 * 4. After running, verify the results by checking a few sample records:
 *    SELECT TOP 100 activity_description FROM ActivityLog 
 *    WHERE activity_time < ''2026-01-15''
 *    ORDER BY activity_time DESC;
 * 
 * 5. If you need to revert, you can restore from the backup table
 * 
 * LIMITATIONS:
 * - SQL Server's pattern matching is limited compared to regex
 * - Some edge cases may not be caught
 * - Very complex PII patterns might need manual review
 * 
 * If more sophisticated cleaning is needed, consider:
 * - Using a CLR function with .NET regex capabilities
 * - Exporting data to a script/application for processing
 * - Manual review of edge cases identified by the analysis script
 */
