import axios from 'axios';
import { IdLookupFn } from '.';
import { Logger } from '@nestjs/common';
import * as wkx from 'wkx';
import { readLastUpdatedDateSicar } from './read.last.updated.date.sicar';
import { retryWithDelay, isRetryableError } from '../utils/retry';

const logger = new Logger('car.lat.long.lookup');

const DATA_API_URL = `${process.env.GFW_DATASET_API_URL}/sfb_bra_sicar/v202508/query/json`;

/**
 * Validates that a CAR ID is safe to interpolate into a SQL IN clause.
 *
 * CAR IDs follow the shape `UF-NNNNNNN-<32 hex chars>`, e.g.
 * `TO-1701903-BDF7049077694A9A8FFB13E1D88EE3F5`. We validate against a
 * permissive character set rather than the exact shape so that future SICAR
 * format changes are not rejected, while still guaranteeing the value cannot
 * break out of the quoted SQL literal.
 */
const isValidCarIdString = (id: string) => {
  return typeof id === 'string' && /^[A-Za-z0-9-]+$/.test(id);
};

/**
 * Escapes a value for use inside a single-quoted SQL literal.
 * Defense in depth: IDs are already charset-validated before reaching here.
 */
const escapeSqlLiteral = (value: string) => value.replace(/'/g, "''");

export const carLookup: IdLookupFn = async (ids) => {
  const result = {};

  // Separate invalid ID strings so they never reach the SQL query
  const formatValidatedIds: string[] = [];

  ids.forEach((id) => {
    if (!isValidCarIdString(id)) {
      logger.error(`❌ Invalid CAR ID format: ${id}`);
      result[id] = {
        errorDetails: [`CAR LookUp: invalid string format for ID ${id}`],
      };
    } else {
      result[id] = {};
      formatValidatedIds.push(id);
    }
  });

  if (!formatValidatedIds.length) {
    logger.error('No valid CAR IDs provided for lookup.');
    return result;
  }

  const sqlIds = formatValidatedIds.map((id) => `'${escapeSqlLiteral(id)}'`).join(',');

  try {
    const sicarLastUpdated = await readLastUpdatedDateSicar();
    const response = await retryWithDelay(
      () =>
        axios.get(DATA_API_URL, {
          headers: {
            'x-api-key': process.env.GFW_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
          params: {
            sql: `SELECT property_c,geom FROM mytable WHERE property_c IN (${sqlIds})`,
          },
        }),
      { retries: 4, delayMs: 4000, backoff: 'exponential', isRetryable: isRetryableError, logger }
    );

    if (response.data.data.length > 0) {
      response.data.data.forEach((found) => {
        if (result[found.property_c]) {
          const buffer = Buffer.from(found.geom, 'hex');
          const parsedBuffer = wkx.Geometry.parse(buffer);
          result[found.property_c] = {
            geometry: parsedBuffer.toGeoJSON(),
          };
          if (sicarLastUpdated.idDataUpdated) {
            result[found.property_c]['ID Updated Date'] = sicarLastUpdated.idDataUpdated;
          }
        }
      });
    }

    if (response.data.data.length < formatValidatedIds.length) {
      formatValidatedIds.forEach((id) => {
        if (!result[id].geometry) {
          result[id] = {
            errorDetails: [`CAR LookUp: did not find lat/long for ${id}`],
          };
        }
      });
    }
  } catch (error) {
    logger.error(`carLookup failed for ${sqlIds}`, error.stack || error);
    formatValidatedIds.forEach((id) => {
      result[id] = {
        errorDetails: [
          `${error.name}: ${error.message}`,
          `There was an error in the CAR lat/long lookup for ${id}`,
        ],
      };
    });
  }

  return result;
};
