export const createList = `
-- Insert [Lists] Table
INSERT INTO Lists(
  user_id, list_name, list_table_name, list_analysis_table_name, list_status_id,
  location_classification, custom_attribute_names, custom_attribute_types, associated_gfwlist, version, commodity, template_id
) VALUES (
  @user_id, @list_name, @list_table_name, @list_analysis_table_name, @list_status_id,
  @location_classification, @custom_attribute_names, @custom_attribute_types, @associated_gfwlist, @version, COALESCE(@commodity, NULL), 0
)
-- Return ID of list entry
SELECT SCOPE_IDENTITY() as list_id
`;
