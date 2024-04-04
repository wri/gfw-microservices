/**
 * Return the WDPA yearly loss for given list and filter for optional location
 * @listId INT,
 * @locationId INT | NULL
 * Returns type GetWDPAYearlyLossType
 */

export const getWDPAYearlyLoss = `
DECLARE @listTable NVARCHAR(100) = ''
DECLARE @analysisTable NVARCHAR(100) = ''
DECLARE @TEMPLATE NVARCHAR(MAX)

SELECT @listTable=l.list_table_name, @analysisTable=l.list_analysis_table_name FROM [dbo].[Lists] l WHERE l.id =  @listID

SET @TEMPLATE = '
  SELECT 
      @listId as listId,
      lt.location_id as locationId,
      an.country_specific_deforestation_wdpa_yearly as countrySpecificDeforestationWdpaYearly
  FROM 
      dbo.[{LIST_TABLE_NAME}] lt 
  JOIN 
      dbo.[{ANALYSIS_TABLE_NAME}] an ON an.location_id = lt.location_id 
  WHERE 
      (@locationId IS NULL OR lt.location_id = @locationId)
  ';

SET @TEMPLATE = REPLACE(@TEMPLATE, '{LIST_TABLE_NAME}', @listTable);
SET @TEMPLATE = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE_NAME}', @analysisTable);

EXEC sp_executesql @TEMPLATE,
    N'@listID INT, @locationId INT',
    @listID=@listID, @locationId=@locationId;
`;

export type GetWDPAYearlyLossType = {
  listId: number;
  locationId: number;
  countrySpecificDeforestationWdpaYearly: string | null;
};
