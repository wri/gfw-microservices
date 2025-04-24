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

COMMIT TRANSACTION;
PRINT 'attribute_name is now case-sensitive (SQL_Latin1_General_CP1_CS_AS).';
GO
