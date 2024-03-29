/**
 * Return the protected areas by category area for a given country and list
 * @listId INT,
 * Returns type GetProtectedAreasByCategoryAreaType
 */

export const getCountrySpecificDeforestationWithoutLocationId = `
SELECT 
  ISNULL(country_specific_deforestation_yearly, '{}') as countrySpecificDeforestation,
  ISNULL(tree_cover_loss_by_country_yearly, '{}') as treeCoverLoss
FROM 
  dbo.Analyses 
WHERE 
  list_id = @listID
`;

export type GetCountrySpecificDeforestationWithoutLocationIdType = {
  countrySpecificDeforestation: string;
  treeCoverLoss: string;
};
