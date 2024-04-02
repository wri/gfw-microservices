/**
 * Return the protected areas by category area for a given country and list
 * @listId INT,
 * Returns type GetProtectedAreasByCategoryAreaType
 */

export const getLandmarkAnnualLossWithoutLocationIdFilter = `
SELECT 
  ISNULL(country_specific_deforestation_landmark_yearly, '{}') as countrySpecificDeforestation,
  ISNULL(tree_cover_loss_by_country_landmark_yearly, '{}') as treeCoverLoss
FROM 
  dbo.Analyses 
WHERE 
  list_id = @listID
`;

export type GetLandmarkAnnualLossWithoutLocationIdFilterType = {
  countrySpecificDeforestation: string;
  treeCoverLoss: string;
};
