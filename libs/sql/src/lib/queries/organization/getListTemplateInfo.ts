/**
 * @list_table NVARCHAR(150)
 */
export const getListTemplateInfo = `
--Obtain the template id and location classification for the list.
							SELECT template_id, location_classification FROM Lists WHERE list_table_name = @list_table
						
`;
