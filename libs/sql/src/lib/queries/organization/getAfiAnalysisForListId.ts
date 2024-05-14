export const getAfiAnalysisForListId = `
  SELECT TOP 100
    AF.list_id as listId,
    AF.gadm_id AS gadmId,
    AF.natural_land_area AS coverageHA,
    AF.natural_land_deforested_area AS naturalForestLossHA,
    AF.total_area_ha AS totalAreaHa,
    AF.jrc_land_area AS jrcLandArea,
    AF.jrc_land_deforested_area AS jrcLandDeforestedArea,
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
  WHERE AF.location_id = -1
  AND AF.gadm_id IS NOT NULL
  AND (AF.negligible_risk < 0.5 OR AF.negligible_risk > 99.5)
  AND AF.list_id = @listId
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
  jrcLandArea: number;
  jrcLandDeforestedArea: number;
}

export type AfiAnalysisDataForList = AfiAnalysisRowForList[];
