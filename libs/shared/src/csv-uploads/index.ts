import { Logger } from '@nestjs/common';
import { umlLookUp } from './uml.lat.long.lookup';
import { carLookup } from './carid.lat.long.lookup';

const logger = new Logger('csv.id.based.system');

// @see {@link https://gfw.atlassian.net/browse/GPV-4541}
// @see {@link https://gfw.atlassian.net/browse/GPV-4540}
export const UNSUPPORTED_ID_TYPE_MESSAGE =
  "You have entered an invalid ID not found in the system's database, please ensure you have entered the ID value correctly.";

export enum CSV_ID_TYPES {
  UML = 'UML',
  CAR = 'CAR',
}

type Data = Record<string, unknown>;

export type IdLookupFn = (
  ids: string[]
) => Promise<{ [ID: string]: { geometry?: ''; errorDetails?: 'string' } }>;

export type IdTypeOptions = {
  handler: IdLookupFn;
  chunkSize: number;
  columnsWithIdValues: string[];
  validateColumns?: string[];
};

export const ID_TYPE_HANDLER: Record<string, IdTypeOptions> = {
  [CSV_ID_TYPES.UML]: {
    handler: umlLookUp,
    chunkSize: 1000,
    columnsWithIdValues: ['ID', 'Palm Mill ID'],
    validateColumns: ['ID | Palm Mill ID', 'Location Name', 'Analysis Radius | Analysis Area'],
  },
  [CSV_ID_TYPES.CAR]: {
    handler: carLookup,
    chunkSize: 500,
    columnsWithIdValues: ['ID'],
    validateColumns: ['ID', 'ID Type', 'Location Name'],
  },
};

export const applyLookUpByChunks = async (
  data: Data[],
  idType: string,
  options: IdTypeOptions
): Promise<Record<string, unknown>[]> => {
  const { handler: lookup, columnsWithIdValues, chunkSize } = options;
  const updates = [];
  const column = columnsWithIdValues.find((colName) => !!data[0][colName]);

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunkMax = Math.min(data.length, i + chunkSize);
    const chunk = data.slice(i, chunkMax);
    logger.log(`${idType} LookUp Chunk Size: ${chunk.length}`);

    const chunkResp = await lookup(chunk.map((row) => row[column] as string));

    chunk.forEach((row) => {
      updates.push(
        Object.assign(row, {
          ...(chunkResp[row[column] as string] ?? {}),
        })
      );
    });
  }

  return updates;
};

export const resolveLatLongHandlerByIdType = async (
  key: string,
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  const possibleUpdates = await applyLookUpByChunks(data, key, ID_TYPE_HANDLER[key]);
  data.forEach((row, i) => Object.assign(row, possibleUpdates[i]));
  return data;
};

export const idBasedSystemHandler = async (
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  const groups: Record<string, Record<string, unknown>[]> = {};
  const errors: Error[] = [];

  /* ── 1. scan & group ────────────────────────────────────────────── */
  data.forEach((row) => {
    try {
      const key = determineIdType(row); // may throw
      logger.log(`${key} ID Based List Identified`);
      const { missingFields, isValid } = validateIdBased(key, row);

      if (!isValid) {
        throw new Error(`Missing mandatory fields: ${missingFields.join(',')}`);
      }

      (groups[key] ??= []).push(row);
    } catch (error) {
      logger.error(error);
      resolveFlaggedRowsByValueFound(row, error);
      errors.push(error);
    }
  });

  /* ── 2. process each valid group (runs even if there were errors) ─ */
  await Promise.all(
    Object.entries(groups).map(async ([key, rows]) => {
      const handler = ID_TYPE_HANDLER[key];
      if (handler) {
        await resolveLatLongHandlerByIdType(key, rows);
      }
    })
  );

  /* ── 3. surface the error in *after* work is done 
    only for testing because the list should not fail processing  ─────────────── */
  if (errors.length && process.env.NODE_ENV === 'test') {
    throw new Error(errors[0].message);
  }

  return data;
};

export const csvLatLongIdBasedTransformer = async (
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  if (!data.length) {
    throw new Error('Bad CSV Input: No data to process');
  }

  if (isAnIdColumnPresent(data[0])) {
    return await idBasedSystemHandler(data);
  }

  return data;
};

/**
 * Decisive columns, more info
 * @see {@link https://gfw.atlassian.net/browse/GPV-4543}
 *
 * @param Object<unknown>
 * @returns string | boolean
 * @throws Error unsupported_id_message
 */
export const determineIdType = (row: Record<string, unknown>) => {
  const templateColumns = Object.keys(row);

  if (templateColumns.length < 1) {
    throw new Error('Bad CSV Input: No data to process');
  }

  let type: CSV_ID_TYPES;

  // this could house mixed types but is certainly required for CAR
  const idTypeColumn = templateColumns.includes('ID Type');
  const isMillList = templateColumns.includes('ID') || templateColumns.includes('Palm Mill ID');

  if (idTypeColumn) {
    type = String(row['ID Type'] ?? '')
      .trim()
      .toUpperCase() as CSV_ID_TYPES;

    if (!type || !Object.keys(ID_TYPE_HANDLER).includes(type)) {
      logger.error(`InvalidTypeError: [${type}] ${UNSUPPORTED_ID_TYPE_MESSAGE}`);
      throw new Error(UNSUPPORTED_ID_TYPE_MESSAGE);
    }

    return type;
  } else if (!idTypeColumn && isMillList) {
    return CSV_ID_TYPES.UML;
  }

  throw new Error(UNSUPPORTED_ID_TYPE_MESSAGE);
};

export const validateIdBased = (idType: string, firstRow: Record<string, unknown>) => {
  const { validateColumns } = ID_TYPE_HANDLER[idType];
  const dataColumns = Object.keys(firstRow);

  const missingFields = validateColumns.filter((requiredColumn) => {
    // treat ' | ' like an OR
    if (requiredColumn.includes(' | ')) {
      return !dataColumns.some((thisColumn) => requiredColumn.split(' | ').includes(thisColumn));
    } else {
      return !dataColumns.includes(requiredColumn);
    }
  });

  return {
    missingFields,
    isValid: missingFields.length === 0,
  };
};

function resolveFlaggedRowsByValueFound(row: Record<string, unknown>, error: Error) {
  const errorDetails = (row['errorDetails'] || []) as string[];
  errorDetails.push(error.message);
  return Object.assign(row, {
    ...row,
    errorDetails,
  });
}

export function isAnIdColumnPresent(data: Record<string, unknown>) {
  // this could house mixed types but is certainly required for CAR
  const firstRowCols = Object.keys(data);
  const idTypeColumn = firstRowCols.includes('ID Type');
  const isMillList = firstRowCols.includes('ID') || firstRowCols.includes('Palm Mill ID');

  if (idTypeColumn || isMillList) {
    return true;
  }

  return idTypeColumn || isMillList;
}
