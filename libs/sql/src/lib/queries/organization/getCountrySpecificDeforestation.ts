/**
 * Return the protected areas by category area for a given country and list
 * @listId INT,
 * @locationId INT,
 * Returns type GetProtectedAreasByCategoryAreaType
 */

export const getCountrySpecificDeforestation = `
DECLARE @listTable NVARCHAR(100) = ''
DECLARE @analysisTable NVARCHAR(100) = ''
DECLARE @TEMPLATE NVARCHAR(MAX)

SELECT 
  @listTable=l.list_table_name,
  @analysisTable=l.list_analysis_table_name 
FROM 
  [dbo].[Lists] l 
WHERE 
  l.id =  @listID

SET @TEMPLATE = '
  SELECT ISNULL(an.country_specific_deforestation_yearly, '{}') as countrySpecificDeforestation, 
  ISNULL(an.tree_cover_loss_by_country_yearly, '{}') as treeCoverLoss 
FROM 
  dbo.[{LIST_TABLE_NAME}] lt 
JOIN 
  dbo.[{ANALYSIS_TABLE_NAME}] an ON an.location_id = lt.location_id WHERE lt.location_id = @locationId'
SET @TEMPLATE = REPLACE(@TEMPLATE, '{LIST_TABLE_NAME}', @listTable);
SET @TEMPLATE = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE_NAME}', @analysisTable);

EXEC sp_executesql @TEMPLATE,
    N'@listID INT, @locationId INT ',
    @listID=@listID, @locationId=@locationId
`;

export type GetCountrySpecificDeforestationType = {
  countrySpecificDeforestation: string;
  treeCoverLoss: string;
};
