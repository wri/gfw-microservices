-- GPV-5286: Recreate AnalysisLimits indexes to include new columns
-- To be applied to gfwpro database


-- Drop the old index
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'CK_OrgType_Unique' AND object_id = OBJECT_ID('dbo.AnalysisLimits'))
BEGIN
    DROP INDEX CK_OrgType_Unique ON [dbo].[AnalysisLimits];
END

-- For queries filtering by OrgType
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AnalysisLimits_OrgType_UpdateTime' AND object_id = OBJECT_ID('dbo.AnalysisLimits'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AnalysisLimits_OrgType_UpdateTime
    ON [dbo].[AnalysisLimits] (OrgType, update_time DESC)
    INCLUDE (OrgID, MaxAreaPerList, MaxAreaAnalyzeablePerYear, max_locations_per_year, tokens_per_year);
END

-- For queries filtering by OrgID
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AnalysisLimits_OrgID_UpdateTime' AND object_id = OBJECT_ID('dbo.AnalysisLimits'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AnalysisLimits_OrgID_UpdateTime
    ON [dbo].[AnalysisLimits] (OrgID, update_time DESC)
    INCLUDE (OrgType, MaxAreaPerList, MaxAreaAnalyzeablePerYear, max_locations_per_year, tokens_per_year);
END
