export const getTemplateMetadata = `SELECT
TM.id,
TM.template_id,
TM.template_datum_field_name,
TM.template_datum_field_description,
TM.template_datum_type_id,
TM.template_datum_mandatory,
TM.template_datum_system,
UT.ui_type,
T.location_type_id,
T.template_name,
LT.location_type_name
FROM TemplateMetadata TM
LEFT JOIN UITypes UT on TM.template_datum_ui_id = UT.id
LEFT JOIN Templates T ON TM.template_id = T.id
LEFT JOIN LocationType LT ON T.location_type_id = LT.id`;
