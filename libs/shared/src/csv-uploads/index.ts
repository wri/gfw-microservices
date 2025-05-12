import { Logger } from '@nestjs/common';
import { umlLookUp } from './uml.lat.long.lookup';
import { carLookup } from './carid.lat.long.lookup';

const logger = new Logger('csv.id.based.system');

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
  column: string;
};

const ID_TYPE_HANDLER: Record<string, IdTypeOptions> = {
  [CSV_ID_TYPES.UML]: {
    handler: umlLookUp,
    chunkSize: 1000,
    column: 'ID',
  },
  [CSV_ID_TYPES.CAR]: {
    handler: carLookup,
    chunkSize: 500,
    column: 'ID',
  },
};

export const applyLookUpByChunks = async (
  data: Data[],
  idType: string,
  options: IdTypeOptions
): Promise<Record<string, unknown>[]> => {
  const { handler: lookup, column, chunkSize } = options;
  const updates = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunkMax = Math.min(data.length, i + chunkSize);
    const chunk = data.slice(i, chunkMax);
    logger.log(`${idType} LookUp Chunk Size: ${chunk.length}`);

    const chunkResp = await lookup(
      chunk.map((row) => row[column] as string) // {id:{latitude?, longitude?, geometry?, errorDetails?}}
    );

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
  idType: string,
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  const key = idType.trim().toUpperCase();
  if (!ID_TYPE_HANDLER[key]) {
    throw new Error(`No lat/long support for ID ${idType}`);
  }

  logger.log(`Handling lat/long based from ID Type: ${idType}`);
  const possibleUpdates = await applyLookUpByChunks(data, key, ID_TYPE_HANDLER[key]);

  data.forEach((row, i) => Object.assign(row, possibleUpdates[i]));
  return data;
};

export const idBasedSystemHandler = async (
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  const groups: Record<string, Record<string, unknown>[]> = {};
  data.forEach((row) => {
    const rawKey = (row['ID Type'] as string | undefined) ?? '';
    let key = rawKey.trim().toUpperCase();

    if (!key) {
      // empty system will be skipped down the road
      key = '';

      // what if this row has “ID” but we can't identify the ID Type column? ⇒ UML fallback (?)
      if (row['ID'] !== undefined) {
        key = 'UML';
      }
    }

    (groups[key] ??= []).push(row);
  });

  await Promise.all(
    Object.entries(groups).map(async ([key, rows]) => {
      // skip empty system
      if (key === '') {
        return;
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
  const templateColumns = Object.keys(firstRow);
  const isIdSystem = templateColumns.includes('ID Type');
  const isIdPresent = templateColumns.includes('ID');

  if (isIdSystem) {
    if (!isIdPresent) {
      // bad template ⇒ leave data untouched or // throw new Error(`Bad CSV Input: column 'ID' must be present if 'ID Type' is present`);
      return data;
    }

    return await idBasedSystemHandler(data);
  }

  if (isIdPresent) {
    return await resolveLatLongHandlerByIdType('UML', data);
  }

  return data;
};
