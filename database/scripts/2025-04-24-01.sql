/*========================================================================================
  -- GPV-4433
  -- SQL MultiScript
  Make [dbo].[ListAttributes].[attribute_name] case-sensitive (SQL_Latin1_General_CP1_CS_AS)
  Compatible with every supported SQL Server build
========================================================================================*/
SET NOCOUNT ON;
SET XACT_ABORT ON;  -- roll back the whole TX on any error
GO

DECLARE
    @schema   sysname  = N'dbo',
    @table    sysname  = N'ListAttributes',
    @column   sysname  = N'attribute_name',
    @ciColl   sysname  = N'SQL_Latin1_General_CP1_CI_AS',
    @csColl   sysname  = N'SQL_Latin1_General_CP1_CS_AS',
    @pkName   sysname,
    @sql      nvarchar(max);

/*-----------------------------------------------------
  1. Bail if the column is already case-sensitive
-----------------------------------------------------*/
IF EXISTS (
    SELECT 1
    FROM   sys.columns AS c
    JOIN   sys.tables  AS t
           ON t.object_id = c.object_id
    WHERE  t.name   = @table
      AND  SCHEMA_NAME(t.schema_id) = @schema
      AND  c.name   = @column
      AND  c.collation_name = @csColl
)
BEGIN
    PRINT 'Nothing to do – column is already case-sensitive.';
    RETURN;
END

/*-----------------------------------------------------
  2. Abort if data has case-insensitive already
-----------------------------------------------------*/
IF EXISTS (
    SELECT list_id,
           LOWER(attribute_name) AS dup_name,
           COUNT(*)             AS cnt
    FROM   dbo.ListAttributes
    GROUP  BY list_id, LOWER(attribute_name)
    HAVING COUNT(*) > 1
)
BEGIN
    RAISERROR('Aborted: already exist that differ only by case. Resolve them first.',16,1);
    RETURN;
END

BEGIN TRANSACTION;

/*-----------------------------------------------------
  3. Capture foreign keys that reference the column
-----------------------------------------------------*/
IF OBJECT_ID('tempdb..#FK') IS NOT NULL DROP TABLE #FK;
CREATE TABLE #FK
(
    id         int IDENTITY(1,1) PRIMARY KEY,
    drop_sql   nvarchar(max) NOT NULL,
    create_sql nvarchar(max) NOT NULL
);

INSERT #FK (drop_sql, create_sql)
SELECT
    N'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(pt.schema_id))
                   + N'.' + QUOTENAME(pt.name)
                   + N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';',

    N'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(pt.schema_id))
                   + N'.' + QUOTENAME(pt.name)
                   + N' ADD CONSTRAINT ' + QUOTENAME(fk.name)
                   + N' FOREIGN KEY ('
                   + STUFF((
                       SELECT N', ' + QUOTENAME(pc.name)
                       FROM   sys.foreign_key_columns AS fkc2
                       JOIN   sys.columns AS pc
                              ON pc.object_id = fkc2.parent_object_id
                             AND pc.column_id = fkc2.parent_column_id
                       WHERE  fkc2.constraint_object_id = fk.object_id
                       ORDER  BY fkc2.constraint_column_id
                       FOR XML PATH(''), TYPE).value('.','nvarchar(max)')
                     ,1,2,N'')
                   + N') REFERENCES '
                   + QUOTENAME(@schema) + N'.' + QUOTENAME(@table) + N' ('
                   + STUFF((
                       SELECT N', ' + QUOTENAME(rc.name)
                       FROM   sys.foreign_key_columns AS fkc2
                       JOIN   sys.columns AS rc
                              ON rc.object_id = fkc2.referenced_object_id
                             AND rc.column_id = fkc2.referenced_column_id
                       WHERE  fkc2.constraint_object_id = fk.object_id
                       ORDER  BY fkc2.constraint_column_id
                       FOR XML PATH(''), TYPE).value('.','nvarchar(max)')
                     ,1,2,N'')
                   + N') ON DELETE ' + fk.delete_referential_action_desc
                   + N' ON UPDATE ' + fk.update_referential_action_desc + N';'
FROM   sys.foreign_keys AS fk
JOIN   sys.tables       AS pt ON pt.object_id = fk.parent_object_id
WHERE  fk.referenced_object_id = OBJECT_ID(QUOTENAME(@schema) + N'.' + QUOTENAME(@table));

/*-- Drop the referencing FKs --*/
DECLARE @i int = 1, @cnt int, @drop_sql nvarchar(max);
SELECT @cnt = COUNT(*) FROM #FK;
WHILE @i <= @cnt
BEGIN
    SELECT @drop_sql = drop_sql FROM #FK WHERE id = @i;
    EXEC (@drop_sql);
    SET @i += 1;
END

/*-----------------------------------------------------
  4. Drop the primary key
-----------------------------------------------------*/
SELECT @pkName = kc.name
FROM   sys.key_constraints AS kc
WHERE  kc.parent_object_id = OBJECT_ID(QUOTENAME(@schema)+N'.'+QUOTENAME(@table))
  AND  kc.type = 'PK';

IF @pkName IS NOT NULL
BEGIN
    SET @sql = N'ALTER TABLE ' + QUOTENAME(@schema) + N'.' + QUOTENAME(@table)
             + N' DROP CONSTRAINT ' + QUOTENAME(@pkName) + N';';
    EXEC (@sql);
END

/*-----------------------------------------------------
  5. Alter the column collation
-----------------------------------------------------*/
SET @sql = N'ALTER TABLE ' + QUOTENAME(@schema) + N'.' + QUOTENAME(@table)
         + N' ALTER COLUMN ' + QUOTENAME(@column)
         + N' NVARCHAR(64) COLLATE ' + @csColl + N' NOT NULL;';
EXEC (@sql);

/*-----------------------------------------------------
  6. Re-create the primary key
-----------------------------------------------------*/
IF @pkName IS NOT NULL
BEGIN
    SET @sql = N'ALTER TABLE ' + QUOTENAME(@schema) + N'.' + QUOTENAME(@table)
             + N' ADD CONSTRAINT ' + QUOTENAME(@pkName)
             + N' PRIMARY KEY CLUSTERED (list_id, ' + QUOTENAME(@column) + N');';
    EXEC (@sql);
END

/*-----------------------------------------------------
  7. Re-create the foreign keys
-----------------------------------------------------*/
SET @i = 1;
DECLARE @create_sql nvarchar(max);
SELECT @cnt = COUNT(*) FROM #FK;
WHILE @i <= @cnt
BEGIN
    SELECT @create_sql = create_sql FROM #FK WHERE id = @i;
    EXEC (@create_sql);
    SET @i += 1;
END

COMMIT TRANSACTION;
PRINT 'attribute_name is now case-sensitive (SQL_Latin1_General_CP1_CS_AS).';
GO
