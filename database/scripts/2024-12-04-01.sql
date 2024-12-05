-- [GPV-3648] To deploy for all clientstores using SQL Multi Script 
-- Fixes typeorm querybuilder auto increment identity column

-- Drop the existing table
DROP TABLE ListAttributes;

-- Recreate the table with the 'id' column as an identity
CREATE TABLE ListAttributes (
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [list_id] INT NOT NULL,
    [attribute_name] NVARCHAR(64) NOT NULL,
    [attribute_type] INT NOT NULL
);