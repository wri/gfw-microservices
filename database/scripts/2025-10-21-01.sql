-- [GPV-5065]: Change list_id column from SMALLINT to INT in [dbo].[AFIAnalysis]
-- To be applied across environments: DEV, QA, STAGING, PROD

BEGIN TRY
    -- Check if the column exists and is SMALLINT
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'AFIAnalysis' 
        AND COLUMN_NAME = 'list_id' 
        AND DATA_TYPE = 'smallint'
    )
    BEGIN
        PRINT 'Starting alteration of [dbo].[AFIAnalysis].list_id from SMALLINT to INT...';

        -- Drop indexes that depend on list_id
        IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AFIAnalysis_list_id' AND object_id = OBJECT_ID('[dbo].[AFIAnalysis]'))
        BEGIN
            DROP INDEX [IX_AFIAnalysis_list_id] ON [dbo].[AFIAnalysis];
            PRINT 'Dropped index: IX_AFIAnalysis_list_id';
        END

        -- Alter the column type from SMALLINT to INT
        ALTER TABLE [dbo].[AFIAnalysis]
        ALTER COLUMN [list_id] INT NULL;

        PRINT '[dbo].[AFIAnalysis] changed: list_id column altered from SMALLINT to INT';

        -- Recreate the index
        CREATE NONCLUSTERED INDEX [IX_AFIAnalysis_list_id] ON [dbo].[AFIAnalysis]([list_id] ASC);
        PRINT 'Recreated index: IX_AFIAnalysis_list_id';

        PRINT 'Successfully completed alteration of [dbo].[AFIAnalysis].list_id';
    END
    ELSE
    BEGIN
        PRINT '[dbo].[AFIAnalysis]: list_id column is already INT or does not exist';
    END
END TRY
BEGIN CATCH
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();
    
    PRINT 'Error altering [dbo].[AFIAnalysis]: ' + @ErrorMessage;
    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH
GO