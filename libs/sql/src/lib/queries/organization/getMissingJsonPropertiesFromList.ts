/**
 * @summary
 * using an array of properties,
 * checks if each property exists in [attributes] column,
 * for given list_table_name out of list_id
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––
 * @param ListId INT
 * @param JsonProperties  NVARCHAR(MAX) -- e.g. '["ID","ID Type","UploadedBy"]'
 */
export const getMissingJsonPropertiesFromList = `
/* -----------------------------------------------------------------
  1. table for this list
  -----------------------------------------------------------------*/
DECLARE @listTableName NVARCHAR(MAX);
DECLARE @ListId INT = @0

SELECT @listTableName = [list_table_name]
FROM   dbo.[Lists]
WHERE  [id] = @ListId;


/* -----------------------------------------------------------------
  3. temp table of expected property names
  -----------------------------------------------------------------*/
IF OBJECT_ID('tempdb..#Props') IS NOT NULL
  DROP TABLE #Props;

CREATE TABLE #Props (
	PropertyName nvarchar(200) COLLATE Latin1_General_BIN2 PRIMARY KEY
);

INSERT INTO #Props (PropertyName)
SELECT [attribute_name]
FROM [ListAttributes]
WHERE [list_id] = @ListId

/* -----------------------------------------------------------------
  4. Dynamic SQL that collects properties never seen in [attributes]
     with COLLATION FIX is on the JOIN predicate
  -----------------------------------------------------------------*/
DECLARE @sql nvarchar(max) = N'
;WITH keys_present AS (
    SELECT DISTINCT j.[key]       -- this column is Latin1_General_BIN2
    FROM   ' + QUOTENAME(PARSENAME(@listTableName, 1)) + N' AS t
    CROSS  APPLY OPENJSON(t.[attributes]) AS j
)
SELECT p.PropertyName as MissingProperties
FROM   #Props AS p
LEFT   JOIN keys_present k
       ON k.[key] = p.PropertyName
WHERE  k.[key] IS NULL;
';

EXEC (@sql);

/* -----------------------------------------------------------------
  5. Clean Up
  -----------------------------------------------------------------*/
IF OBJECT_ID('tempdb..#Props') IS NOT NULL
  DROP TABLE #Props;
`;

export interface MissingPropertiesReturnType {
  MissingProperties: string[];
}
