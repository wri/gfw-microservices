import { Logger } from '@nestjs/common';
import { SQLUtils } from '../util';
import * as sql from 'mssql';
import manifest = require('../queries/organization/sp-orgs-manifest.json');

export async function checkStoredProcedureTsImplementation(clientDb: string) {
  const logger = new Logger('check.org.ts.sp');

  /* ------------------------------------------------------------------
   * 1️⃣  Gather procedure names from the manifest if exists
   * ----------------------------------------------------------------*/
  const spNames = manifest.files as string[];
  // The list we send to SQL must include the exact DB proc names (with `usp`)
  // const spNamesWithPrefix: string[] = tsFiles.map((f) => path.basename(f, '.ts'));

  // For logging we also keep a prettier version: strip `usp` + lowercase first char
  // const spNamesPretty: string[] = spNamesWithPrefix.map((name) => {
  //   if (/^usp/i.test(name)) {
  //     const raw = name.substring(3);
  //     return raw.charAt(0).toLowerCase() + raw.slice(1);
  //   }
  //   return name.charAt(0).toLowerCase() + name.slice(1);
  // });

  // logger.debug(`Procedures found in code: ${spNamesPretty.join(', ')}`);

  /* ------------------------------------------------------------------
   * 2️⃣  Prepare SQL + parameters
   * ----------------------------------------------------------------*/
  const missingSpQuery = `
      DECLARE @Known TABLE (ProcName SYSNAME);
      INSERT INTO @Known
      SELECT value FROM OPENJSON(@TsNamesJson);

      SELECT name AS MissingSp
      FROM sys.procedures
      WHERE name LIKE 'usp%'
        AND name NOT IN (SELECT ProcName FROM @Known);
    `;

  const parameters = [
    {
      field: 'TsNamesJson',
      type: sql.NVarChar(sql.MAX),
      value: JSON.stringify(spNames),
    },
  ];

  /* ------------------------------------------------------------------
   * 3️⃣  Execute and categorise
   * ----------------------------------------------------------------*/
  try {
    const result = await SQLUtils.queryDB<{ MissingSp: string }[]>(
      clientDb,
      missingSpQuery,
      parameters
    );
    const missingSp: string[] = result.map((r: { MissingSp: string }) => r.MissingSp);

    const implementedSet = new Set(spNames);
    const implementedSp = [...implementedSet].filter((n) => !missingSp.includes(n));

    logger.log(`✅  ${implementedSp.length} implemented / ❌  ${missingSp.length} missing`);

    return {
      implementedSp,
      missingSp,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
