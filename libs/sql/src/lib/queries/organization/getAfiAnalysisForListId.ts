const commonQuery = `
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
      WHEN AF.negligible_risk < 0.5 THEN CAST(0 AS BIT)  -- false
      WHEN AF.negligible_risk > 99.5 THEN CAST(1 AS BIT)  -- true
      ELSE NULL  -- anything else means is errored
    END AS negligibleRisk,
    AA.[Country] as country,
    AA.[State] as state,
    AA.[Sub State] as subState
  FROM [AFIAnalysis] AF
  LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = AF.gadm_id
`;

export const getAfiAnalysisForListId = `
  ${commonQuery}
  WHERE AF.location_id = -1
  AND AF.gadm_id IS NOT NULL
  AND (AF.negligible_risk < 0.5 OR AF.negligible_risk > 99.5)
  AND AF.list_id = @listId
  AND (@locationId IS NULL OR AF.location_id = @locationId)
  ORDER BY negligibleRisk ASC, naturalForestLossHA DESC;`;

export const getAfiAnalysisForListIdAndLocation = `
  ${commonQuery}
  WHERE (AF.negligible_risk < 0.5 OR AF.negligible_risk > 99.5)
  AND AF.list_id = @listId
  AND AF.location_id = @locationId
  ORDER BY negligibleRisk ASC, naturalForestLossHA DESC;`;

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
