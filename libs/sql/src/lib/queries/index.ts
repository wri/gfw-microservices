// Re-exporting type definitions
export * from './system';
export * from './organization';

import * as systemQueries from './system';
import * as orgQueries from './organization';

/**
 * Return the matching SQL query string for given DB and named query
 * @param isSystemQuery - true if looking up a system/gfwpro DB query
 * @param storedProcedureName - name of query
 * @returns string | null
 */
const storedProcToQueryStr = (isSystemQuery, storedProcedureName) => {
  // 1. Return immediately if storedProcedureName is already a query string
  if (storedProcedureName.includes(' ')) {
    return storedProcedureName;
  }

  // 2. Normalize name: remove 'usp' prefix and lowercase first letter
  let cleanQueryName = storedProcedureName.replace(/^usp/, '');
  cleanQueryName = cleanQueryName.charAt(0).toLowerCase() + cleanQueryName.slice(1);

  // 3. Check system queries
  if (isSystemQuery) {
    return getQueryOrWarn(systemQueries, cleanQueryName, 'System');
  }

  // 4. Check and return org queries
  return getQueryOrWarn(orgQueries, cleanQueryName, 'Org');
};

/**
 * Get the SQL query string for a stored procedure or query name
 * Add standard defaults for MS SQL server query semantics that code relies on
 * @param isSystemQuery - true if looking up a system/gfwpro DB query
 * @param storedProcedureName - name of query
 * @returns
 */
export const getQueryStr = (isSystemQuery: boolean, storedProcedureName: string) => {
  const queryStr = storedProcToQueryStr(isSystemQuery, storedProcedureName);
  if (queryStr) {
    return `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; ${queryStr}`;
  }
  return queryStr;
};

/**
 *  Get the query string for a given name from the provided queries object
 *  Logs a warning if the query is not found or is not a string.
 * @param queries
 * @param name
 * @param type
 * @returns
 */
const getQueryOrWarn = (queries, name, type) => {
  const query = queries?.[name];
  if (!query) {
    console.warn(`${type} query "${name}" not found or invalid.`);
    return null;
  }

  if (typeof query !== 'string') {
    console.warn(`${type} query "${name}" exists but is not a string.`);
    return null;
  }

  return query;
};
