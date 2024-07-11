const commonQuery = `
SELECT TOP 1
    [total_area_ha] as totalAreaHa
    ,[negligible_risk] as negligibleRisk
  FROM [AFIAnalysis]
`;

export const getAfiNegligibleRiskStatsForListId = `
  ${commonQuery}
  WHERE location_id = -1
  AND gadm_id IS NULL
  AND list_id = @listId`;

export const getAfiNegligibleRiskStatsForListIdAndLocation = `
  ${commonQuery}
  WHERE location_id = @locationId
  AND list_id = @listId
`;

export interface AfiNegligibleRiskStatsForList {
  totalAreaHa: number;
  negligibleRisk: number;
}
