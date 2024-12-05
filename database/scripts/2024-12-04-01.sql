-- [GPV-3648] To deploy for all clientstores using SQL Multi Script 
-- Fixes typeorm querybuilder auto increment identity column

DROP TABLE IF EXISTS ListAttributes;

CREATE TABLE ListAttributes (
    [id] INT IDENTITY(1,1) NOT NULL,
    [list_id] INT NOT NULL,
    [attribute_name] NVARCHAR(64) NOT NULL,
    [attribute_type] INT NOT NULL,
    CONSTRAINT PK_ListAttributes PRIMARY KEY ([attribute_name])
);
