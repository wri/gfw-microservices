-- [GPV-4115] 
-- for gfwpro only
CREATE TABLE dbo.ConverterStatus (
    [id] INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    [name] NVARCHAR(32) NOT NULL,
    [start_time] DATETIME NULL,
    [status] NVARCHAR(MAX) NULL,
    [organization_id] INT NULL,
    [list_id] INT NULL
);

CREATE NONCLUSTERED INDEX IX_ConverterStatus_Name_Id
    ON dbo.ConverterStatus (name ASC, id ASC);
GO