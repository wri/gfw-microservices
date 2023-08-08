import { DataSource } from 'typeorm';
import { SQL_CONFIG } from '../config/config';
import { getQueryStr } from '../queries';

/**
 * Replace the given regex (with a capture pattern) in given inputStr and optionally
 * replace the matched string with `newCmd(capture)`
 */
const regexReplaceCmd = (inputStr, regex, newCmd = null) => {
  let updatedStr = inputStr;
  let matchInfo;
  // eslint-disable-next-line no-cond-assign
  while ((matchInfo = regex.exec(updatedStr)) !== null) {
    const replacementStr = newCmd ? `${newCmd}(${matchInfo[1]})` : matchInfo[1];
    updatedStr = updatedStr.replace(matchInfo[0], replacementStr);
  }
  return updatedStr;
};

// convert SQL statements from MS SQL server syntax to SQLite syntax
const mssql2sqliteQuery = (mssqlQuery) => {
  let updatedQuery = mssqlQuery;
  updatedQuery = regexReplaceCmd(updatedQuery, /CONVERT\(VARCHAR\(\d+\),\s*(\w+)\)/g);
  updatedQuery = regexReplaceCmd(updatedQuery, /STRING_AGG\((\w+), ','\)/g, 'group_concat');
  // 'TOP (n)' should be replaced with LIMIT n, but large results unlikely in test, so ignoring for now
  updatedQuery = updatedQuery.replaceAll(/TOP\s*\(\d+\)/g, '');
  return updatedQuery;
};

// Replace MS SQL server syntax style query with '@variable' with values from params
const sqliteApplyParams = (baseQuery, params = []) => {
  if (baseQuery.includes('Analyses-Dashboard')) {
    throw new Error('sql.utils: Not implemented: Analyses-Dashboard');
  }
  let queryStr = baseQuery;
  params.forEach((paramInfo) => {
    const paramValue = paramInfo.value;
    if (typeof paramValue === 'string') {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue}'`);
    } else if (paramValue instanceof Date) {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue.toISOString()}'`);
    } else if (typeof paramValue === 'object') {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue.toString()}'`);
    } else {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, paramValue);
    }
  });
  return queryStr;
};

export const sqliteQuery = async <T>(queryRunner: DataSource, mssqlQuery, params, databaseName) => {
  let queryToExecute
  try {
    const isSystemQuery = databaseName === SQL_CONFIG.database || databaseName === null;
    const storedProcedureQuery = getQueryStr(isSystemQuery, mssqlQuery);
    const baseQuery = mssql2sqliteQuery(storedProcedureQuery);
    queryToExecute = sqliteApplyParams(baseQuery, params);
    

    const result = await queryRunner.query(queryToExecute);
    console.log(result)
    return [result] as T;
  } catch (err) {
    console.log(queryToExecute)
    console.error('sqliteQuery failed', queryToExecute || mssqlQuery, err);
    throw err;
  }
};
