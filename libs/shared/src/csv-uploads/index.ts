import { Logger } from '@nestjs/common';
import { umlLookUp } from './uml.lat.long.lookup';
import { carLookup } from './carid.lat.long.lookup';

const logger = new Logger('csv.id.based.system');

// @see {@link https://gfw.atlassian.net/browse/GPV-4541}
export const UNSUPPORTED_ID_TYPE_MESSAGE =
  'The defined ID system %ID% is not recognized by GFW Pro. Please enter a recognized ID system value';

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
  data.forEach((row) => {
    // empty system will be skipped down the road
    let key;
    try {
      key = determineIdType(row);
    } catch (error) {
      logger.error(error);
    }

    if (!key) {
      key = '';
    }

    (groups[key] ??= []).push(row);
  });

  await Promise.all(
    Object.entries(groups).map(async ([key, rows]) => {
      // empty or unsupported systems will be skipped
      if (key === '' || !ID_TYPE_HANDLER[key]) {
        return resolveFlaggedRowsByValueFound(key, rows);
      }

      await resolveLatLongHandlerByIdType(key, rows);
    })
  );

  return data;
};

export const csvLatLongIdBasedTransformer = async (
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  if (!data.length) {
    throw new Error('Bad CSV Input: No data to process');
  }
  const firstRow = data[0] as Record<string, unknown>;
  const type = determineIdType(firstRow);

  if (!type) {
    return data;
  }

  logger.log(`${type} ID Based List Identified`);
  const { missingFields, isValid } = validateIdBased(type as string, firstRow);

  if (!isValid) {
    throw new Error(`Missing mandatory fields: ${missingFields.join(',')}`);
  }

  return await idBasedSystemHandler(data);
};

/**
 * Decisive columns, more info
 * @see {@link https://gfw.atlassian.net/browse/GPV-4543}
 *
 * @param Object<unknown>
 * @returns string | boolean
 * @throws Error unsupported_id_message
 */
export const determineIdType = (firstRow: Record<string, unknown>) => {
  const templateColumns = Object.keys(firstRow);
  let type: CSV_ID_TYPES | false = false;

  if (templateColumns.length < 1) {
    return type;
  }

  // this could house mixed types but is certainly required for CAR
  const idTypeColumn = templateColumns.includes('ID Type');
  const isMillList = templateColumns.includes('ID') || templateColumns.includes('Palm Mill ID');

  if (idTypeColumn) {
    const rawKey = String((firstRow['ID Type'] as string | undefined) ?? '')
      .trim()
      .toUpperCase() as CSV_ID_TYPES;
    // empty cells with ID Type column will be treated as unsupported
    if (!rawKey || !ID_TYPE_HANDLER[rawKey]) {
      logger.log(UNSUPPORTED_ID_TYPE_MESSAGE.replace('%ID%', rawKey));
      throw new Error(UNSUPPORTED_ID_TYPE_MESSAGE.replace(' %ID% ', ' '));
    }
    type = rawKey;
  } else if (!idTypeColumn && isMillList) {
    type = CSV_ID_TYPES.UML;
  }

  return type;
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

function resolveFlaggedRowsByValueFound(key: string, data: Record<string, unknown>[]) {
  data.forEach((row) => {
    const errorDetails = (row['errorDetails'] || []) as string[];
    errorDetails.push(UNSUPPORTED_ID_TYPE_MESSAGE.replace('%ID%', key));
    Object.assign(row, {
      ...row,
      errorDetails,
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });
  });

  return data;
}
