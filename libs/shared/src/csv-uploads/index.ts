import { Logger } from "@nestjs/common";
import { getUniversalMillLatLong, describeUmlLookup, umlLookUp } from "./uml.lat.long.lookup";
import axios from "axios";
import { carLookup, describeCarLookup, getCarIdLatLong } from "./carid.lat.long.lookup";
import { Geometry, GeoJson, FeatureCollection } from '@wri-monorepos/geo';

const logger = new Logger('csv.id.based.system');

export enum CSV_ID_TYPES {
  UML = 'UML',
  CAR = 'CAR'
}

type Data = Record<string, unknown>;
export type IdLookupFn = (ids: Data[]) =>
  Promise<Record<string, { geometry?: Geometry } | { errorDetails?: string }>>;

export type IdTypeOptions = {
  data?: Data[],
  handler: IdLookupFn,
  chunkSize: number,
  column: string;
};
export type IdTypeHandler = (
  data: Data[]
) => Promise<Record<string, unknown>[]>;

const ID_TYPE_HANDLER: Record<string, IdTypeOptions> = {
  [CSV_ID_TYPES.UML]: {
    handler: umlLookUp,
    chunkSize: 100,
    column: 'ID'
  },
  [CSV_ID_TYPES.CAR]: {
    handler: carLookup,
    chunkSize: 500,
    column: 'ID'
  },
};

// todo: make a parametrized function similar to getPalmOilMillLatLong for the chunking/bacthing
export const applyLookUpByChunks = async (
  data: Data[],
  idType: string,
  lookup: IdLookupFn,
  column: string = 'ID',
  chunkSize: number = 100
) => {
  let result = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunkMax = Math.min(data.length, i + chunkSize);
    const chunk = data.slice(i, chunkMax);

    try {
      const chunkResp = await lookup(
        chunk.map((r) => r[column] as Data) // { id: geometry }
      );           

      chunk.forEach((r: Data) => {
        const match = chunkResp[r[column] as string];
        if (match) {
          r.geometry = match.geom;
        }
        // const geometry = result[r[column] as string];
        // if (geometry) {
        //   r.geometry = geometry.geom as Geometry
        // } else {
        //   (r as any).errorDetails = [`${idType} lookup: IDs ${ids} not found`];
        // }
      });
    } catch (err: any) {
      // Tag whole chunk on catastrophic failure
      chunk.forEach(
        (r) =>
          ((r as any).errorDetails = [`${idType} lookup failed: ${err?.message}`])
      );
    }
  }
};


export const resolveLatLongHandlerByIdType = async (
  idType: string,
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> => {
  const key = idType.trim().toUpperCase();
  const { handler, column, chunkSize } = ID_TYPE_HANDLER[key];

  if (!handler) {
    throw new Error(`No lat/long support for ID ${idType}`);
  }

  logger.log(`Handling lat/long based from ID Type: ${idType}`);
  return applyLookUpByChunks(data, key, handler, column, chunkSize);
};

export const idBasedSystemHandler = async (data: Record<string, unknown>[]): Promise<Record<string, unknown>[]> => {
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
      };

      // either (a) mutate the rows in-place *or* (b) return copies.
      const maybeNewRows = await resolveLatLongHandlerByIdType(key, rows);

      // If copies were returned, fold them back into the original array (keeps order)
      if (Array.isArray(maybeNewRows) && maybeNewRows !== rows) {
        maybeNewRows.forEach((updated, i) => Object.assign(rows[i], updated));
      }
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

    return idBasedSystemHandler(data);
  }

  if (isIdPresent) {
    return resolveLatLongHandlerByIdType('UML', data);
  }

  return data;
};

export const describeLatLongLookups = async () => {
  const ID_TYPE_HANDLER = {
    [CSV_ID_TYPES.UML]: describeUmlLookup,
    [CSV_ID_TYPES.CAR]: describeCarLookup
  };

  return await Promise.all(
    Object.keys(ID_TYPE_HANDLER).map(async (idType) => {
      return {[idType]: await ID_TYPE_HANDLER[idType]()};
    })
  );
}