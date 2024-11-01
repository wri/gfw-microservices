-- Adding [ListAttributes] table to each organization
-- tool: SQL Multi Script

CREATE TABLE [dbo].[ListAttributes]
(
[id] INT NOT NULL, -- PrimaryGeneratedColumn
[list_id] INT NULL,
[attribute_name] NVARCHAR(64),
[attribute_type] SMALLINT
) 
GO