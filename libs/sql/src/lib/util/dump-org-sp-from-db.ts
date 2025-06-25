import * as fs   from 'fs';
import * as path from 'path';
import * as sql from 'mssql';
import { Logger } from '@nestjs/common';
import { SQLUtils } from '../util';

const manifest = require('../queries/organization/orgs-sp-manifest.json');

export const dumpOrgSpFromDb = async (orgDb: string) => {
  const spNames = (manifest.spTsFiles as string[])      // ['createAnalysisTable', …]
  /** 
   * ------------------------------------------------
   * 1️⃣  prepare query
   * ------------------------------------------------
   */
  const sqlQuery = `
    SELECT name,
           OBJECT_DEFINITION(object_id) AS definition
    FROM   sys.procedures
    WHERE name LIKE 'usp%'
      AND name NOT IN (@list)
  `;

  const sqlParameters = [{
    field: 'list',
    type: sql.NVarChar(sql.MAX),
    value: spNames.join(',')
  }];

  /** 
   * ------------------------------------------------
   * 2️⃣  pull definitions
   * ------------------------------------------------
   */
  try {
    const result = await SQLUtils.queryDB<{ name: string; definition: string }[]>(
      orgDb,
      sqlQuery,
      sqlParameters
    );

    /** 
     * ------------------------------------------------
     * 3️⃣  write ts files
     * ------------------------------------------------
     */
    result.forEach((file) => {
      const { name, definition } = formatProcedureRow(file);
      const outDir  = path.resolve(
        process.cwd(),
        'libs/sql/src/lib/queries/organization/dumped'
      );
      if (!fs.existsSync(path.join(outDir, `${name}.ts`))) {
        // fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, `${name}.ts`), definition);
      }
    });
    Logger.debug(`✨  Wrote ${result.length} procedures to generated/org-${orgDb}-procedures.ts`);
  } catch (error) {
    Logger.error(error);
  }
}

/**
 * Converts one row from
 *   { name: 'uspUpdateFolderAccessTime', definition: '<full CREATE PROC text>' }
 * into the block:
 *
 * /**
 *  * @param @foo INT
 *  * @param @bar NVARCHAR(50)
 *  *\/
 * export const updateFolderAccessTime = `
 * <SQL body (everything after the first AS)>
 * `;
 */
export function formatProcedureRow(
  row: { name: string; definition: string }
): { name: string, definition: string } {
  const { name: spName, definition } = row;

  /* ---------- 1. split header/body ----------------------------------- */
  const asIdx = definition.search(/\bAS\b/i);
  if (asIdx === -1) {
    // fallback – give the whole thing if no AS found
    return {
      name: spName,
      definition: `export const ${spName} = \`\n${definition.replace(/`/g, '\\`')}\n\`;`
    };
  }
  const header = definition.slice(0, asIdx);
  const body   = definition.slice(asIdx + 2)        // skip “AS”
                          .replace(/^[\s\r\n]+/, '') // trim leading space/newlines
                          .replace(/`/g, '\\`')      // escape back-ticks
                          .replace(/\$\{/g, '$\\{'); // escape ${}

  /* ---------- 2. parameter block ------------------------------------- */
  // take everything after the PROCEDURE name up to AS
  let paramsBlock = header.split(/PROCEDURE/i)[1] ?? '';
  // drop the proc name itself (handles [dbo].uspX, dbo.uspX, uspX)
  paramsBlock = paramsBlock.replace(
    /^\s*(?:\[[^\]]+\]\.)?(?:dbo\.)?(usp[\w$]+)\s*/i,
    ''
  );

  // split on commas that are *not* inside parentheses
  const params: string[] = [];
  let depth = 0,
    chunk  = '';
  for (const ch of paramsBlock) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (chunk.trim()) params.push(chunk.trim());
      chunk = '';
    } else {
      chunk += ch;
    }
  }
  if (chunk.trim()) params.push(chunk.trim());

  /* ---------- 3. build JSDoc ---------------------------------------- */
  const jsDoc =
    params.length > 0
      ? ['/**', ...params.map((p) => ` * ${p}`), ' */'].join('\n')
      : '/** (no parameters) */';

  /* ---------- 4. constant name -------------------------------------- */
  const constName = spName
    .replace(/^usp/i, '')
    .replace(/^./, (c) => c.toLowerCase());

  /* ---------- 5. return formatted block ----------------------------- */
  return {
    name: spName,
    definition: `${jsDoc}
export const ${constName} = \`
${body}
\`;`
  };
}
