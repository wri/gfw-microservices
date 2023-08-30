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

  let cleanQueryName = storedProcedureName.replace('usp', '');
  cleanQueryName = cleanQueryName.charAt(0).toLowerCase() + cleanQueryName.slice(1);

  if (cleanQueryName.includes('createListAnalysisStatus')) {
    console.log(orgQueries[cleanQueryName]);
  }

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
