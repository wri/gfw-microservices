/** @function {createListNameSchema}
 *   @summary Copy Location from one list to another
 *   @param  {string} list_name - Using list's name to create it's schema
 *   @return {Object} Returns object
 */
export const createListNameSchema = (list_name) => ({
  list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
  analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
});
