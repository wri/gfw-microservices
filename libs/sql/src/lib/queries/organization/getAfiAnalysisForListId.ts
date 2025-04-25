export const getAfiAnalysisForListId = `
DECLARE @tableName NVARCHAR(100);
DECLARE @usesGadm4 BIT;


IF EXISTS (SELECT TOP 1 1 FROM [AFIAnalysis] WHERE gadm_id LIKE '4%')
BEGIN
    SET @tableName = 'gfwpro.dbo.[list-administrativeAreas41]';
    SET @usesGadm4 = 1;
END
ELSE
BEGIN
    SET @tableName = 'gfwpro.dbo.[list-administrativeAreas36]';
    SET @usesGadm4 = 0;
END
DECLARE @sql NVARCHAR(MAX);

SET @sql = N'
  SELECT TOP 100
      CAST(@usesGadm4 AS BIT) AS usesGadm4,
      AF.list_id as listId,
      AF.gadm_id AS gadmId,
      ISNULL(AF.natural_land_area,0) AS coverageHA,
      ISNULL(AF.natural_land_deforested_area,0) AS naturalForestLossHA,
      ISNULL(AF.total_area_ha,0) AS totalAreaHa,
      ISNULL(AF.jrc_land_area,0) AS jrcCoverageHA,
      ISNULL(AF.jrc_land_deforested_area,0) AS jrcNaturalForestLossHA,
      ISNULL(AF.protected_areas_area,0) AS protectedAreasHA,
      ISNULL(AF.landmark_area,0) AS landmarkHA,
      CASE
        WHEN AF.negligible_risk < 0.5 THEN CAST(0 AS BIT)
        WHEN AF.negligible_risk > 99.5 THEN CAST(1 AS BIT)
        ELSE NULL
      END AS negligibleRisk,
      AA.[Country] as country,
      AA.[State] as state,
      AA.[Sub State] as subState
  FROM [AFIAnalysis] AF
  LEFT JOIN ' + @tableName + ' AA ON AA.gadmid = AF.gadm_id
  WHERE AF.location_id = -1
  AND AF.gadm_id IS NOT NULL
  AND (AF.negligible_risk < 0.5 OR AF.negligible_risk > 99.5)
  AND AF.list_id = @listId
  ORDER BY negligibleRisk ASC, naturalForestLossHA DESC;
';

EXEC sp_executesql
  @sql,
  N'@listId INT, @usesGadm4 BIT',
  @listId, @usesGadm4;
`;

export const getAfiAnalysisForListIdAndLocation = `
DECLARE @tableName NVARCHAR(100);

IF EXISTS (SELECT TOP 1 1 FROM [AFIAnalysis] WHERE gadm_id LIKE '4%')
    SET @tableName = 'gfwpro.dbo.[list-administrativeAreas41]';
ELSE
    SET @tableName = 'gfwpro.dbo.[list-administrativeAreas36]';

DECLARE @sql NVARCHAR(MAX);

SET @sql = N'
  SELECT TOP 100
      AF.list_id as listId,
      AF.gadm_id AS gadmId,
      ISNULL(AF.natural_land_area,0) AS coverageHA,
      ISNULL(AF.natural_land_deforested_area,0) AS naturalForestLossHA,
      ISNULL(AF.total_area_ha,0) AS totalAreaHa,
      ISNULL(AF.jrc_land_area,0) AS jrcCoverageHA,
      ISNULL(AF.jrc_land_deforested_area,0) AS jrcNaturalForestLossHA,
      ISNULL(AF.protected_areas_area,0) AS protectedAreasHA,
      ISNULL(AF.landmark_area,0) AS landmarkHA,
      CASE
        WHEN AF.negligible_risk < 0.5 THEN CAST(0 AS BIT)
        WHEN AF.negligible_risk > 99.5 THEN CAST(1 AS BIT)
        ELSE NULL
      END AS negligibleRisk,
      AA.[Country] as country,
      AA.[State] as state,
      AA.[Sub State] as subState
  FROM [AFIAnalysis] AF
  LEFT JOIN ' + @tableName + ' AA ON AA.gadmid = AF.gadm_id
  WHERE AF.list_id = @listId
    AND AF.location_id = @locationId
  ORDER BY negligibleRisk ASC, naturalForestLossHA DESC;
';

EXEC sp_executesql @sql,
  N'@listId INT, @locationId INT',
  @listId, @locationId;
`;

export interface AfiAnalysisRowForList {
  listId: number;
  gadmId: string;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  negligibleRisk: boolean;
  country: string;
  state: string;
  subState: string;
  jrcCoverageHA: number;
  jrcNaturalForestLossHA: number;
}

export type AfiAnalysisDataForList = AfiAnalysisRowForList[];
