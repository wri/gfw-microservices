-- fixes the issue for GPV-3468: column added to the [orgs].[analysis-xxxx] tables, slipped from GVP-3415
-- • it should
-- • find tables with the pattern analysis-% 
-- • find column dissolved_geom_object_key from the table if exists,
-- • gets constraints associated with said column
-- • drop constraints and column

DECLARE @sql NVARCHAR(MAX) = N'';
DECLARE @tableName NVARCHAR(128);
DECLARE @constraintName NVARCHAR(128);
DECLARE @columnName NVARCHAR(128) = 'dissolved_geom_object_key';

-- Loop through all tables in the current database with the pattern [analysis-%]
DECLARE table_cursor CURSOR FOR 
SELECT t.name 
FROM sys.tables AS t 
WHERE t.name LIKE 'analysis-%';

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @tableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if the column exists in the table
    IF EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE name = @columnName 
        AND object_id = OBJECT_ID('dbo.' + @tableName)
    )
    BEGIN
        -- Find the constraint on the column dissolved_geom_object_key
        SELECT @constraintName = dc.name
        FROM sys.default_constraints AS dc
        INNER JOIN sys.columns AS col 
            ON col.default_object_id = dc.object_id
        WHERE col.name = @columnName
        AND col.object_id = OBJECT_ID('dbo.' + @tableName);

        -- Generate the SQL to drop the constraint if found
        IF @constraintName IS NOT NULL
        BEGIN
            SET @sql += 'ALTER TABLE dbo.[' + @tableName + '] DROP CONSTRAINT [' + @constraintName + '];' + CHAR(13);
        END

        -- Generate the SQL to drop the column
        SET @sql += 'ALTER TABLE dbo.[' + @tableName + '] DROP COLUMN [' + @columnName + '];' + CHAR(13);
    END

    FETCH NEXT FROM table_cursor INTO @tableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

-- Execute the generated SQL
EXEC sp_executesql @sql;
