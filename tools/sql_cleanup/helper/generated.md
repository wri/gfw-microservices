```ts
/**
 * @param list_id INT
 */
export const getUsersInternalShareLists = `
SELECT * FROM InternalShareRoutes WHERE list_id = @list_id
`;

/**
 * @param listId INT
 */
export const getDashboardDissolvedS3Location = `
SELECT dissolved_geom_object_key FROM Analyses WHERE list_id = @listId
`;

/**
 * @param user_id INT
 */
export const getUserPendingInternalShareLists = `
SELECT * FROM InternalShareRoutes WHERE user_id = @user_id
`;

/**
 * @param list_id SMALLINT
 */
export const getListVectorTilesPath = `
SELECT vector_tiles_storage_path FROM dbo.Lists WHERE id = @list_id
`;

/**
 * @param list_table NVARCHAR(150)
 */
export const getListTemplateInfo = `
SELECT template_id, location_classification FROM Lists WHERE list_table_name = @list_table
`;

/**
 * @param admin_id INT
 * @param user_id INT
 * @param list_id INT
 * @param datetime DATETIME
 */
export const shareInternalList = `
INSERT INTO InternalShareRoutes(admin_id, user_id, list_id, datetime) VALUES (@admin_id, @user_id, @list_id, @datetime)
`;

/**
 * @param timestamp DATETIME2 NULL
 * @param list_id SMALLINT NULL
 */
export const getListsDashboardTimestamp = `
IF @list_id IS NULL
    SELECT id FROM dbo.Lists WHERE dashboard_last_submit = @timestamp
ELSE
    SELECT dashboard_last_results FROM dbo.Lists WHERE id = @list_id
`;

/**
 * @param list_id SMALLINT NULL
 */
export const getListErrorFiles = `
IF @list_id IS NOT NULL
    SELECT error_file_storage_path FROM dbo.Lists WHERE error_file_storage_path IS NOT NULL AND id = @list_id
ELSE
    SELECT id, error_file_storage_path FROM dbo.Lists WHERE error_file_storage_path IS NOT NULL
`;

/**
 * @param list_id INT
 */
export const getMaxId = `
DECLARE @ANALYSIS_TABLE NVARCHAR(150)
SET @ANALYSIS_TABLE = (
    SELECT list_table_name FROM Lists WHERE id = @list_id
)
SELECT MAX(location_id) as max_id from [@ANALYSIS_TABLE]
`;

/**
 * @param orgID INT = 0
 */
export const getPolicyList = `
IF (@orgID > 0)
BEGIN
    SELECT @orgID AS organization_id, document_name FROM AccountProfile CROSS JOIN Policies
END
ELSE
BEGIN
    SELECT document_name FROM Policies
END
`;

/**
 * @param listID INT
 */
export const getAdminAreas = `
DECLARE @listLocationTableName NVARCHAR(1000)
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = 'SELECT DISTINCT Country, State, [Sub State] From [' + @listLocationTableName + '] ORDER BY Country, State, [Sub State]'
EXEC sp_executesql @SQL
`;

/**
 * @param analysis_table_name NVARCHAR(150)
 * @param location_id INT
 * @param location_status_id INT
 */
export const updateLocationAnalysisStatus = `
BEGIN TRANSACTION
    UPDATE [{ANALYSIS_TABLE}] SET location_status_id = {LOCATION_STATUS_ID} WHERE location_id = {LOCATION_ID}
COMMIT TRANSACTION
`;

/**
 * @param listId INT
 */
export const getDashboardCommodityLocations = `
DECLARE @listTable NVARCHAR(1000)
DECLARE @analysisTable NVARCHAR(1000)
SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM Lists WHERE id = @listId
SELECT {LIST_ID} AS list_id, LT.[Latitude], LT.[Longitude], LT.[location_id], LT.[Location Name], LT.[Country], LT.[State], LT.[Sub State], LT.[gadmid], LT.Geometry.ToString() AS [WKTGeometry]
FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT ON LT.location_id = AT.location_id WHERE AT.location_status_id = 2
`;

/**
 * @param list_name NVARCHAR(150)
 * @param column_name NVARCHAR(50)
 * @param value DECIMAL(18,6)
 */
export const updateListAnalysisNumberResult = `
BEGIN TRANSACTION
    UPDATE Analyses SET {COLUMN_NAME} = {VALUE} WHERE list_id = {LIST_ID}
COMMIT TRANSACTION
`;

/**
 * @param analysis_table_name NVARCHAR(150)
 * @param location_id INT
 * @param column_name NVARCHAR(50)
 * @param value DECIMAL(18,6)
 */
export const updateLocationAnalysisNumberResult = `
BEGIN TRANSACTION
    UPDATE [{ANALYSIS_TABLE}] SET {COLUMN_NAME} = {VALUE} WHERE location_id = {LOCATION_ID}
COMMIT TRANSACTION
`;

/**
 * @param analysis_table_name NVARCHAR(150)
 * @param location_id INT
 * @param column_name NVARCHAR(50)
 * @param value VARCHAR(MAX)
 */
export const updateLocationAnalysisStringResult = `
BEGIN TRANSACTION
    UPDATE [{ANALYSIS_TABLE}] SET {COLUMN_NAME} = '{VALUE}' WHERE location_id = {LOCATION_ID}
COMMIT TRANSACTION
`;

/**
 * @param list_name NVARCHAR(150)
 * @param column_name NVARCHAR(50)
 * @param value VARCHAR(MAX)
 */
export const updateListAnalysisStringResult = `
BEGIN TRANSACTION
    UPDATE [Analyses] SET {COLUMN_NAME} = '{VALUE}' WHERE list_id = {LIST_ID}
COMMIT TRANSACTION
`;

/**
 * @param listId INT
 */
export const getDashboardInvestmentLocations = `
DECLARE @listTable NVARCHAR(1000)
DECLARE @analysisTable NVARCHAR(1000)
SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM Lists WHERE id = @listId
SELECT {LIST_ID} AS list_id, LT.[location_id], LT.[Latitude], LT.[Longitude], LT.[Investment Name] AS [Location Name], LT.[Country], LT.[State], LT.[Sub State], LT.[gadmid], LT.Geometry.ToString() AS [WKTGeometry]
FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT ON LT.location_id = AT.location_id WHERE AT.location_status_id = 2
`;

/**
 * @param analysis_table_name NVARCHAR(150)
 * @param location_ids_array NVARCHAR(MAX)
 * @param location_status_id TINYINT
 */
export const updateLocationAnalysisStatusInBulk = `
BEGIN TRANSACTION
    UPDATE [{ANALYSIS_TABLE}] SET location_status_id = {LOCATION_STATUS_ID} WHERE location_id IN ({LOCATION_IDS})
COMMIT TRANSACTION
`;

/**
 * @param list_table NVARCHAR(150)
 */
export const getAllLocations = `
DECLARE @LIST_TEMPLATE_ID INT
DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)

--Obtain the template id and location classification for the list.
SELECT @LIST_TEMPLATE_ID = template_id, @LOCATION_CLASSIFICATION = location_classification FROM Lists WHERE list_table_name = @list_table

SELECT location_id, @LIST_TEMPLATE_ID AS [template_id], @LOCATION_CLASSIFICATION AS location_classification, Geometry.ToString() as [WKTGeometry]
FROM [@list_table]
`;

/**
 * @param list_id INT
 * @param column_name NVARCHAR(50)
 * @param value VARCHAR(MAX)
 */
export const updateListStringResult = `
BEGIN
    IF @column_name IN ('vector_tiles_storage_path', 'error_file_storage_path')
    BEGIN
        -- Update Column with Value
        BEGIN TRANSACTION
            UPDATE dbo.[Lists]
            SET @column_name = @value
            WHERE id = @list_id
        COMMIT TRANSACTION
    END
    ELSE
        RAISERROR ('Invalid Column Name.', 1, 1);
END
`;

/**
 * @param list_name NVARCHAR(150)
 */
export const updateListAnalysisFailCount = `
DECLARE @listID INT

--Get List ID for the list.
SELECT @listID = id FROM Lists WHERE list_name = @list_name

IF @listID IS NOT NULL
BEGIN
    -- Update Success Count.
    BEGIN TRANSACTION
        UPDATE [Analyses]
        SET analysis_fail_count = analysis_fail_count + 1
        WHERE list_id = @listID
    COMMIT TRANSACTION

    -- Return both success and fail counts.
    BEGIN TRANSACTION
        SELECT analysis_success_count, analysis_fail_count
        FROM [Analyses]
        WHERE list_id = @listID
    COMMIT TRANSACTION
END
`;

/**
 * @param list_name NVARCHAR(150)
 */
export const updateListAnalysisSuccessCount = `
DECLARE @listID INT

--Get List ID for the list.
SELECT @listID = id FROM Lists WHERE list_name = @list_name

IF @listID IS NOT NULL
BEGIN
    -- Update Success Count.
    BEGIN TRANSACTION
        UPDATE [Analyses]
        SET analysis_success_count = analysis_success_count + 1
        WHERE list_id = @listID
    COMMIT TRANSACTION

    -- Return both success and fail counts.
    BEGIN TRANSACTION
        SELECT analysis_success_count, analysis_fail_count
        FROM [Analyses]
        WHERE list_id = @listID
    COMMIT TRANSACTION
END
`;

/**
 * @param list_id INT
 */
export const getLocationsForBatchProcessing = `
DECLARE @list_table NVARCHAR(150)
DECLARE @analysis_table NVARCHAR(150)

--Obtain the template id and location classification for the list.
SELECT @list_table = list_table_name FROM dbo.Lists WHERE id = @list_id
SELECT @analysis_table = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

SELECT L.location_id, CONVERT(VARCHAR(MAX),L.Geometry.STAsBinary(), 2) AS [geom]
    , CASE
        WHEN A.location_status_id IS NULL OR A.total_area = 0 THEN 'New'
        ELSE 'Existing'
    END AS location_status
FROM [@list_table] L
LEFT JOIN (
    SELECT *
    FROM  [@analysis_table]
    WHERE location_status_id = 2
) A ON A.location_id = L.location_id
`;

/**
 * @param list_table NVARCHAR(150)
 * @param analysis_table NVARCHAR(150)
 * @param dry_run BIT
 */
export const updateListStatus = `
DECLARE @list_id INT
DECLARE @listStatus INT
DECLARE @pendingLocations INT
DECLARE @listAnalysisStatus INT

-- Set List Status to still processing (Default)
SET @listStatus = 1

-- Obtain the list id from the list table name.
SELECT @list_id = id FROM Lists WHERE list_table_name = @list_table

-- Determine the number of locations still processing.
SELECT @pendingLocations = COUNT(*) FROM [@analysis_table] WHERE location_status_id = 1

-- Determine the status of the list level analysis.
SELECT @listAnalysisStatus = status_id FROM Analyses WHERE list_id = @list_id

-- If there are no pending locations and list level analysis is complete,
-- set list Status to Available and return Available status.
IF (@pendingLocations = 0 AND @listAnalysisStatus = 2)
BEGIN
    IF (@dry_run = 0)
    BEGIN
        BEGIN TRANSACTION
            UPDATE Lists WITH (ROWLOCK) SET list_status_id = 2 WHERE id = @list_id
        COMMIT TRANSACTION
    END
    SET @listStatus = 2
END
-- If List Level Analysis failed, set list status to failed.
ELSE IF (@pendingLocations = 0 AND @listAnalysisStatus = 3)
BEGIN
    IF (@dry_run = 0)
    BEGIN
        BEGIN TRANSACTION
            UPDATE Lists WITH (ROWLOCK) SET list_status_id = 3 WHERE id = @list_id
        COMMIT TRANSACTION
    END
    SET @listStatus = 3
END
SELECT @listStatus AS ListStatus
`;

/**
 * @param list_id INT
 * @param DashboardUpdates [TT-Analyses-Dashboard] READONLY
 */
export const upsertAnalysesDashboard = `
BEGIN
    ALTER INDEX ALL ON dbo.[Analyses-Dashboard] DISABLE;

    BEGIN TRANSACTION

        /* HANDLE DELETE, IF DISSOLVED LIST */
        DELETE TT
        FROM dbo.[Analyses-Dashboard] TT
        WHERE TT.list_id = @list_id AND location_id = -1;

        /* HANDLE UPDATE, IF EXISTS IN DASHBOARD TABLE */
        UPDATE TT
        SET TT.glad_alerts_coverage = SRC.glad_alerts_coverage
            , TT.glad_alerts_daily = SRC.glad_alerts_daily
            , TT.glad_alerts_weekly = SRC.glad_alerts_weekly
            , TT.glad_alerts_monthly = SRC.glad_alerts_monthly
            , TT.viirs_alerts_daily = SRC.viirs_alerts_daily
            , TT.tree_cover_extent_total = SRC.tree_cover_extent_total
        FROM dbo.[Analyses-Dashboard] AS TT
        INNER JOIN @DashboardUpdates AS SRC
        ON TT.list_id = SRC.list_id
            AND TT.location_id = SRC.location_id
            AND TT.gadm_id = SRC.gadm_id
        WHERE TT.list_id = @list_id;

        /* HANDLE INSERT, IF NOT EXISTS IN DASHBOARD TABLE*/
        INSERT INTO dbo.[Analyses-Dashboard] (
            list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
        )
        SELECT list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
        FROM @DashboardUpdates SRC
        WHERE NOT EXISTS (
            SELECT *
            FROM dbo.[Analyses-Dashboard] AS TT
            WHERE TT.list_id = SRC.list_id
                AND TT.location_id = SRC.location_id
                AND TT.gadm_id = SRC.gadm_id
        );

    COMMIT TRANSACTION

    ALTER INDEX ALL ON dbo.[Analyses-Dashboard] REBUILD;
END
`;

/**
 * @param listID INT
 * @param ColumnsToReturn NVARCHAR(MAX)
 */
export const getListLocationsNoGeom = `
--DECLARE IMPORTANT VARIABLES
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @columnsList NVARCHAR(MAX)

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

IF @ColumnsToReturn IS NOT NULL
BEGIN
    DECLARE @PRESQL NVARCHAR(MAX);
    DECLARE @presql_list_params NVARCHAR(MAX) = '@list_location_table_cols_query VARCHAR(MAX) OUTPUT';

    WITH ColumnsCTE AS (
        SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, ',')
    )

    SELECT @columnsList = CONCAT('''', STRING_AGG(cols, '''', ''''), '''')
    FROM ColumnsCTE;

    -- Obtain the needed columns from the List Location Table.
    SET @PRESQL = N'SELECT @list_location_table_cols_query = STUFF(
            (
                SELECT ''], L.[' + [name] FROM sys.columns
                WHERE
                    [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''' + @listLocationTableName + ''')
                    AND [name] IN (' + @columnsList + ')
                FOR XML PATH('''')
            ), 1, 3, '''') + '']'';';
    SET @PRESQL = REPLACE(@PRESQL, '{LIST_LOCATION_TABLE_NAME}', @listLocationTableName);
    SET @PRESQL = REPLACE(@PRESQL, '{COLUMNS_LIST}', @columnsList);

    EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @listLocationTableCols OUTPUT;

END
ELSE
BEGIN
    -- Obtain the needed columns from the List Location Table. (All but Geometry)
    SELECT @listLocationTableCols = STUFF(
        (
            SELECT '], L.[' + [name] FROM sys.columns
            WHERE
                [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
                AND [name] NOT IN ('Geometry')
            FOR XML PATH(')
        ), 1, 3, '') + '];';
END

-- Return data from both tables
SELECT @listID AS list_id, @listLocationTableCols FROM [@listLocationTableName] L
`;
```
