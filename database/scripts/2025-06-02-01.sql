-- [GPV-4619] add parent_id and error_details to ConverterStatus table
-- for gfwpro only
ALTER TABLE dbo.ConverterStatus
ADD
    [parent_id] INT NULL,
    [error_details] NVARCHAR(MAX) NULL;

-- Uncomment to add a foreign key constraint:
-- ALTER TABLE dbo.ConverterStatus
-- ADD CONSTRAINT FK_ConverterStatus_Parent
-- FOREIGN KEY (parent_id) REFERENCES dbo.ConverterStatus(id);