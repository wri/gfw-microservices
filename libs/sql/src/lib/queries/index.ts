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
const storedProcToQueryStr = (isSystemQuery: boolean, storedProcedureName: string) => {
  // if storedProcedureName is already a query string vs. SP name, return it
  if (storedProcedureName.includes(' ')) {
    return storedProcedureName;
  }

  // Removing prefixes for stored procedures and lowercasing first letter
  let cleanQueryName = storedProcedureName.replace(/^usp/, '');
  cleanQueryName = cleanQueryName.charAt(0).toLowerCase() + cleanQueryName.slice(1);

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

// Add standard defaults for MS SQL server query semantics that code relies on
export const getQueryStr = (isSystemQuery: boolean, storedProcedureName: string) => {
  const queryStr = storedProcToQueryStr(isSystemQuery, storedProcedureName);
  if (queryStr) {
    return `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; ${queryStr}`;
  }
  return queryStr;
};
