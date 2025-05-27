export const getTableQueryString = `
-- Declare variables
DECLARE @tableQueryString NVARCHAR(MAX)

-- Add template column names and respective types
SELECT @tableQueryString = COALESCE(@tableQueryString + ',', '') + CONCAT('[', template_datum_field_name, '] ', DataTypes.data_type)
FROM TemplateMetadata
JOIN DataTypes ON template_datum_type_id = DataTypes.id
-- Ignore custom attributes
WHERE template_id = @template_id AND NOT (template_datum_field_name LIKE '%Attribute%')

-- Add custom columns if needed
IF (@custom_attribute_1 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_1, '] ', @custom_attribute_1_type)
IF (@custom_attribute_2 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_2, '] ', @custom_attribute_2_type)
IF (@custom_attribute_3 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_3, '] ', @custom_attribute_3_type)

-- Add system columns
SET @tableQueryString = CONCAT(@tableQueryString, ', [Geometry] geometry')
SET @tableQueryString = CONCAT(@tableQueryString, ', [attributes] NVARCHAR(MAX)')

-- Add flagged columns
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_general] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_gran_chaco] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_glad] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_forma] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_viirs] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_terrai] INT')

-- Add ErrorDetails
SET @tableQueryString = CONCAT(@tableQueryString, ', [ErrorDetails] NVARCHAR(256) NULL')

SELECT @tableQueryString AS [query_string]
`;

export interface ListTableColumnsQueryString {
  query_string: string;
}
