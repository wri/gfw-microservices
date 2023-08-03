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
export const getQueryStr = (isSystemQuery: boolean, storedProcedureName: string) => {
  // Removing prefixes for stored procedures and lowercasing first letter
  const cleanQueryName = storedProcedureName.replace('uspG', 'g').replace('uspS', 's');
  if (
    isSystemQuery &&
    systemQueries[cleanQueryName] &&
    typeof systemQueries[cleanQueryName] === 'string'
  ) {
    return systemQueries[cleanQueryName];
  } else if (
    !isSystemQuery &&
    orgQueries[cleanQueryName] &&
    typeof orgQueries[cleanQueryName] === 'string'
  ) {
    return orgQueries[cleanQueryName];
  }
  return null;
};
