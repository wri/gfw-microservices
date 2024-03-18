/**
 * Return the protected areas by category area for a given country and list
 * @listId INT,
 * @country VARCHAR,
 * Returns type GetProtectedAreasByCategoryAreaType
 */

export const getCountrySpecificDeforestationWithoutLocationId = `
SELECT 
  ISNULL(country_specific_deforestation_yearly, '{}') as countrySpecificDeforestation
FROM 
  dbo.Analyses 
WHERE 
  list_id = @listID
`;

export type GetCountrySpecificDeforestationWithoutLocationIdType = {
  countrySpecificDeforestation: string;
};
