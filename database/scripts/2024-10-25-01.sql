-- To be run on every organization database, across environment to update [Lists] Tables
-- Tool: SQL Multi Script

ALTER TABLE dbo.Lists
ADD [Commodity] NVARCHAR(150) NULL;
