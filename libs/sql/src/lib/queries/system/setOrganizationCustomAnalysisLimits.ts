export const setOrganizationCustomAnalysisLimits = `MERGE AnalysisLimits AS target
USING (VALUES (@OrgID, NULL, @MaxAreaPerList, @MaxAreaAnalyzeablePerYear)) AS source (OrgID, OrgType, MaxAreaPerList, MaxAreaAnalyzeablePerYear)
ON target.OrgID = source.OrgID
WHEN MATCHED THEN
  UPDATE SET
    target.OrgType = source.OrgType,
    target.MaxAreaPerList = source.MaxAreaPerList,
    target.MaxAreaAnalyzeablePerYear = source.MaxAreaAnalyzeablePerYear
WHEN NOT MATCHED THEN
  INSERT (OrgID, OrgType, MaxAreaPerList, MaxAreaAnalyzeablePerYear)
  VALUES (source.OrgID, source.OrgType, source.MaxAreaPerList, source.MaxAreaAnalyzeablePerYear);`;
