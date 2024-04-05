export const enum AnnualLossFcdFields {
  COUNTRY_SPECIFIC_DEFORESTATION_CLASSIFIED_REGION_YEARLY = 'country_specific_deforestation_classified_region_yearly',
  TREE_COVER_LOSS_ARG_OTBN_YEARLY = 'tree_cover_loss_arg_otbn_yearly',
  COUNTRY_SPECIFIC_DEFORESTATION_WDPA_YEARLY = 'country_specific_deforestation_wdpa_yearly',
  TREE_COVER_LOSS_BY_COUNTRY_WDPA_YEARLY = 'tree_cover_loss_by_country_wdpa_yearly',
  COUNTRY_SPECIFIC_DEFORESTATION_LANDMARK_YEARLY = 'country_specific_deforestation_landmark_yearly',
  TREE_COVER_LOSS_BY_COUNTRY_LANDMARK_YEARLY = 'tree_cover_loss_by_country_landmark_yearly',
  COUNTRY_SPECIFIC_DEFORESTATION_YEARLY = 'country_specific_deforestation_yearly',
  TREE_COVER_LOSS_BY_COUNTRY_YEARLY = 'tree_cover_loss_by_country_yearly',
}

export type GetAnnualLossFcdDataReturnType = {
  [key in AnnualLossFcdFields]?: string;
};

/**
 * Return the protected areas by category area for a given country and list
 * @listId INT,
 * @locationId INT,
 * Returns type GetAnnualLossFcdDataReturnType
 */

export const getAnnualLossFcdData = (fields: AnnualLossFcdFields[]) => `
  DECLARE @listTable NVARCHAR(150) = ''
  DECLARE @analysisTable NVARCHAR(150) = ''
  DECLARE @TEMPLATE NVARCHAR(MAX)

  SELECT 
    @listTable=l.list_table_name,
    @analysisTable=l.list_analysis_table_name 
  FROM 
    [dbo].[Lists] l 
  WHERE 
    l.id = @listID

  SET @TEMPLATE = '
  SELECT
    ${getFieldsSqlQueryWithinStringTemplate(fields)}
  FROM 
    dbo.[{LIST_TABLE_NAME}] lt 
  JOIN 
    dbo.[{ANALYSIS_TABLE_NAME}] an ON an.location_id = lt.location_id 
  WHERE 
    lt.location_id = @locationId'

  SET @TEMPLATE = REPLACE(@TEMPLATE, '{LIST_TABLE_NAME}', @listTable);
  SET @TEMPLATE = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE_NAME}', @analysisTable);

  EXEC sp_executesql @TEMPLATE,
      N'@listID INT, @locationId INT ',
      @listID=@listID, @locationId=@locationId
`;

export const getAnnualLossFcdDataWithoutLocationIdFilter = (fields: AnnualLossFcdFields[]) => `
  SELECT 
    ${getFieldsSqlQuery(fields)}
  FROM 
    dbo.Analyses an
  WHERE 
    list_id = @listID
`;

const getFieldsSqlQueryWithinStringTemplate = (fields: AnnualLossFcdFields[]) =>
  fields.map((f) => `ISNULL(an.${f}, ''{}'') as ${f}`).join(',');

const getFieldsSqlQuery = (fields: AnnualLossFcdFields[]) =>
  fields.map((f) => `ISNULL(an.${f}, '{}') as ${f}`).join(',');
