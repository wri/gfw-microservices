-- ==========================================
--  Collect Large List info including upload format and API flag
-- ==========================================

-- SET up temporary table
IF OBJECT_ID('tempdb..#large_list_data') IS NOT NULL
  DROP TABLE #large_list_data;

-- create temporary table for storing data from EACH organization
CREATE TABLE #large_list_data (
    organization NVARCHAR(MAX),
    large_list_id INT,
    list_id INT,
    list_name NVARCHAR(MAX),
    list_status NVARCHAR(25),
    upload_format NVARCHAR(10), -- column for file format
    is_api_list BIT  -- column for API-originated lists
);

-- Variables
DECLARE @org_id INT;
DECLARE @db_name NVARCHAR(MAX);
DECLARE @org_name NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

-- Cursor over all clientstore organizations
DECLARE db_cursor CURSOR FOR
  SELECT Orgs.organization_db, Orgs.organization_name, Orgs.id
  FROM gfwpro.dbo.Organizations Orgs
  WHERE Orgs.organization_status_id = 2
    AND Orgs.organization_name NOT LIKE '%Blue Raster%'
    AND Orgs.organization_name NOT LIKE '%World Resources Institute%'
    AND Orgs.organization_name NOT LIKE '%WRI Engagement%'
    AND Orgs.organization_name NOT LIKE '%WRI Consultant%'
    AND Orgs.organization_name NOT LIKE '%Pro Product Team%'
    AND Orgs.organization_name NOT LIKE '%GFW Pro LATAM Engagement%'
ORDER BY Orgs.organization_name;

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id

WHILE @@FETCH_STATUS = 0
BEGIN
  IF DB_ID(@db_name) IS NOT NULL
    PRINT CAST(@org_id AS VARCHAR(25)) + ': ' + @db_name;

  BEGIN
      -- Insert list data including upload format and API flag
    SET @sql = N'
      INSERT INTO #large_list_data (
        organization,
        large_list_id,
        list_id,
        list_name,
        list_status,
        upload_format,
        is_api_list
      )
      SELECT
        N''' + REPLACE(@org_name, '''', '''''') + ''' AS organization,
        LL.large_list_id,
        LL.list_id,
        LL.list_name,
        LL.list_status,
        RIGHT(LL.s3_filename, CHARINDEX(''.'', REVERSE(LL.s3_filename)) - 1) AS upload_format,
        CASE WHEN EU.id IS NOT NULL THEN 1 ELSE 0 END AS is_api_list
      FROM [' + @db_name + '].dbo.LargeLists LL
      LEFT JOIN gfwpro.dbo.ExternalUploads EU
        ON LL.s3_filename = EU.uploadKeyFile;';
    -- RIGHT(...) extracts the file extension as upload format
    -- The CASE checks if the list exists in ExternalUploads (i.e., uploaded via API)
    EXEC sp_executesql @sql;
  END

  FETCH NEXT FROM db_cursor INTO @db_name, @org_name, @org_id;
END

CLOSE db_cursor
DEALLOCATE db_cursor;

-- Select the final data
SELECT *
FROM #large_list_data;

-- Drop the temporary table
DROP TABLE #large_list_data;
