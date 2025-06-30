import { Logger } from '@nestjs/common';
import { SQLUtils } from '../util';
import * as sql from 'mssql';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require('../queries/organization/orgs-sp-manifest.json');

export async function checkStoredProcedureTsImplementation(clientDb: string) {
  const logger = new Logger('check.org.ts.sp');

  /* ------------------------------------------------------------------
   * 1️⃣  Gather procedure names from the manifest if exists
   * ----------------------------------------------------------------*/
  const spNames = manifest.files as string[];
  logger.debug(`Procedures found in code: ${spNames.join(', ')}`);

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
      notImplementedSp: missingSp,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
