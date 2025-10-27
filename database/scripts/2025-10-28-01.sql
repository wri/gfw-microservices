USE [gfwpro];
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- 1. Add column with default (sets existing rows to 0)
    ALTER TABLE [dbo].[Organizations]
    ADD [is_api_capable] BIT NOT NULL CONSTRAINT [DF_Organizations_is_api_capable] DEFAULT (0);
    PRINT 'Column [is_api_capable] added successfully.';

    -- 2. Populate based on existing API key data
    UPDATE o
    SET o.is_api_capable = 1
    FROM [dbo].[Organizations] o
    WHERE EXISTS (
        SELECT 1
        FROM [dbo].[ExternalAPIKeys] k
        WHERE k.organization_id = o.id
    );
    PRINT 'Existing API-capable organizations updated.';

    COMMIT TRANSACTION;
    PRINT 'Transaction committed successfully.';
END TRY
BEGIN CATCH
    PRINT 'Error encountered. Rolling back transaction.';
    ROLLBACK TRANSACTION;

    -- Surface the error
    THROW;
END CATCH;
GO

-- Verify the update
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Organizations' 
AND COLUMN_NAME = 'is_api_capable';